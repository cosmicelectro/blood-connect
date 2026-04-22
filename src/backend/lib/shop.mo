import List "mo:core/List";
import Types "../types/shop";
import Common "../types/common";

module {
  public func addShop(
    shops : List.List<Types.MedicalShop>,
    name : Text,
    address : Text,
    phone : Text,
    website : ?Text,
    description : Text,
  ) : Common.Result<(), Text> {
    if (name == "") { return #err("Name is required") };
    let shop : Types.MedicalShop = {
      id = shops.size();
      name = name;
      address = address;
      phone = phone;
      website = website;
      description = description;
    };
    shops.add(shop);
    #ok(());
  };

  public func getShops(shops : List.List<Types.MedicalShop>) : [Types.MedicalShop] {
    shops.toArray();
  };
};
