// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorTipping
 * @notice Kullanicilarin icerik ureticilere PART veya native (BNB) ile
 *         dogrudan bahsis gondermesini saglar.
 *
 * Seffaflik: platform komisyonu sabit ve aciktir (feeBps). Maksimum komisyon
 * %10 ile sinirlanmistir; daha yukari cikartilamaz. Komisyon kullaniciya
 * islem oncesi arayuzde gosterilir.
 */
contract CreatorTipping is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable treasury;
    uint16 public immutable feeBps; // baz puan (100 = %1)
    uint16 public constant MAX_FEE_BPS = 1000; // %10 ust sinir

    event Tipped(
        address indexed from,
        address indexed creator,
        address token, // address(0) => native
        uint256 amount,
        uint256 fee
    );

    constructor(address _treasury, uint16 _feeBps) {
        require(_treasury != address(0), "treasury sifir adres olamaz");
        require(_feeBps <= MAX_FEE_BPS, "komisyon ust siniri asildi");
        treasury = _treasury;
        feeBps = _feeBps;
    }

    /// @notice Native (BNB) ile bahsis gonderir.
    function tipNative(address creator) external payable nonReentrant {
        require(creator != address(0), "gecersiz uretici");
        require(msg.value > 0, "miktar sifir olamaz");

        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 payout = msg.value - fee;

        (bool okCreator, ) = creator.call{value: payout}("");
        require(okCreator, "uretici transferi basarisiz");
        if (fee > 0) {
            (bool okFee, ) = treasury.call{value: fee}("");
            require(okFee, "komisyon transferi basarisiz");
        }
        emit Tipped(msg.sender, creator, address(0), payout, fee);
    }

    /// @notice ERC-20 (PART) ile bahsis gonderir. Once approve gerekir.
    function tipToken(address token, address creator, uint256 amount)
        external
        nonReentrant
    {
        require(creator != address(0), "gecersiz uretici");
        require(amount > 0, "miktar sifir olamaz");

        uint256 fee = (amount * feeBps) / 10_000;
        uint256 payout = amount - fee;

        IERC20(token).safeTransferFrom(msg.sender, creator, payout);
        if (fee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, treasury, fee);
        }
        emit Tipped(msg.sender, creator, token, payout, fee);
    }
}
