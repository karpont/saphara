// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SapharaMarket
 * @notice Platform ici market: satici ilan acar, alici PART ile satin alir,
 *         odeme escrow'da tutulur, alici teslimi onaylayinca saticiya gecer.
 *
 * Seffaflik: platform komisyonu acik (feeBps, max %10). Anlasmazlikta
 * arabuluculuk owner tarafindan yapilir ANCAK owner alicinin/saticinin
 * fonunu kendine cekemez; sadece taraflardan birine yonlendirebilir.
 */
contract SapharaMarket is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable payToken; // PART token
    address public immutable treasury;
    uint16 public immutable feeBps;
    uint16 public constant MAX_FEE_BPS = 1000;

    enum Status { Listed, Purchased, Completed, Refunded, Disputed }

    struct Listing {
        address seller;
        uint256 price;
        address buyer;
        Status status;
        string metadataURI; // urun bilgisi (off-chain)
    }

    uint256 public nextId;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed id, address indexed seller, uint256 price, string metadataURI);
    event Purchased(uint256 indexed id, address indexed buyer);
    event Completed(uint256 indexed id, uint256 payout, uint256 fee);
    event Refunded(uint256 indexed id);
    event Disputed(uint256 indexed id);

    constructor(address _payToken, address _treasury, uint16 _feeBps)
        Ownable(msg.sender)
    {
        require(_payToken != address(0) && _treasury != address(0), "sifir adres");
        require(_feeBps <= MAX_FEE_BPS, "komisyon ust siniri");
        payToken = IERC20(_payToken);
        treasury = _treasury;
        feeBps = _feeBps;
    }

    function list(uint256 price, string calldata metadataURI) external returns (uint256 id) {
        require(price > 0, "fiyat sifir olamaz");
        id = nextId++;
        listings[id] = Listing(msg.sender, price, address(0), Status.Listed, metadataURI);
        emit Listed(id, msg.sender, price, metadataURI);
    }

    /// @notice Alici fonu escrow'a yatirir (once approve gerekir).
    function purchase(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.Listed, "satilik degil");
        require(msg.sender != l.seller, "satici satin alamaz");
        l.buyer = msg.sender;
        l.status = Status.Purchased;
        payToken.safeTransferFrom(msg.sender, address(this), l.price);
        emit Purchased(id, msg.sender);
    }

    /// @notice Alici teslimi onaylar; fon (komisyon dusulerek) saticiya gider.
    function confirmReceipt(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.Purchased, "uygun durumda degil");
        require(msg.sender == l.buyer, "sadece alici");
        l.status = Status.Completed;

        uint256 fee = (l.price * feeBps) / 10_000;
        uint256 payout = l.price - fee;
        payToken.safeTransfer(l.seller, payout);
        if (fee > 0) payToken.safeTransfer(treasury, fee);
        emit Completed(id, payout, fee);
    }

    /// @notice Satici siparisi iptal edip alicinin parasini iade edebilir.
    function refund(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.Purchased, "uygun durumda degil");
        require(msg.sender == l.seller, "sadece satici");
        l.status = Status.Refunded;
        payToken.safeTransfer(l.buyer, l.price);
        emit Refunded(id);
    }

    /// @notice Taraflar anlasmazlik bildirir.
    function openDispute(uint256 id) external {
        Listing storage l = listings[id];
        require(l.status == Status.Purchased, "uygun durumda degil");
        require(msg.sender == l.buyer || msg.sender == l.seller, "taraf degil");
        l.status = Status.Disputed;
        emit Disputed(id);
    }

    /// @notice Owner arabuluculuk yapar: fon YA aliciya YA saticiya gider.
    ///         Owner fonu kendine cekemez.
    function resolveDispute(uint256 id, bool payToSeller) external onlyOwner nonReentrant {
        Listing storage l = listings[id];
        require(l.status == Status.Disputed, "anlasmazlik yok");
        if (payToSeller) {
            l.status = Status.Completed;
            uint256 fee = (l.price * feeBps) / 10_000;
            uint256 payout = l.price - fee;
            payToken.safeTransfer(l.seller, payout);
            if (fee > 0) payToken.safeTransfer(treasury, fee);
            emit Completed(id, payout, fee);
        } else {
            l.status = Status.Refunded;
            payToken.safeTransfer(l.buyer, l.price);
            emit Refunded(id);
        }
    }
}
