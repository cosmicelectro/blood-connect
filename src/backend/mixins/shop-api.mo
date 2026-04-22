import List "mo:core/List";
import ShopLib "../lib/shop";
import ShopTypes "../types/shop";
import Common "../types/common";

mixin (shops : List.List<ShopTypes.MedicalShop>) {

  public shared func addShop(
    name : Text,
    address : Text,
    phone : Text,
    website : ?Text,
    description : Text,
  ) : async Common.Result<(), Text> {
    ShopLib.addShop(shops, name, address, phone, website, description);
  };

  public query func getShops() : async [ShopTypes.MedicalShop] {
    ShopLib.getShops(shops);
  };
};
