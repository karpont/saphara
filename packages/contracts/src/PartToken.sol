// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PartToken
 * @notice Saphara platformunun yardimci tokeni (PART).
 *
 * Tasarim ilkeleri (seffaflik):
 *  - Sabit arz: tum tokenlar dagitimda olusturulur. Dağıtım sonrası MINT YOK.
 *  - Gizli vergi / transfer ucreti YOK.
 *  - Blacklist / transfer kisitlama YOK.
 *  - Sahip (owner) sadece sahipligi birakabilir; arzi degistiremez.
 *
 * Bu, kullaniciyi kandiran "rug-pull" mekanikleri icermez. Sozlesme
 * dogrudan denetlenebilir ve davranisi ongorulebilirdir.
 */
contract PartToken is ERC20, ERC20Permit, Ownable {
    /// @param initialSupply Toplam (sabit) arz, en kucuk birim cinsinden.
    /// @param treasury Tum arzin gonderilecegi ana hesap (hazine) adresi.
    constructor(uint256 initialSupply, address treasury)
        ERC20("Saphara PART", "PART")
        ERC20Permit("Saphara PART")
        Ownable(msg.sender)
    {
        require(treasury != address(0), "treasury sifir adres olamaz");
        _mint(treasury, initialSupply);
    }

    // Kasitli olarak mint/burn yetkisi acilmamistir.
    // Arz, kurulum aninda sabittir. Bu sozlesmede arzi artiracak
    // hicbir fonksiyon yoktur.
}
