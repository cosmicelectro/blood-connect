import List "mo:core/List";
import DonorTypes "types/donor";
import ShopTypes "types/shop";
import DonorApi "mixins/donor-api";
import ShopApi "mixins/shop-api";

actor {
  let donors = List.empty<DonorTypes.DonorProfile>();
  let shops = List.empty<ShopTypes.MedicalShop>();

  include DonorApi(donors);
  include ShopApi(shops);
};
