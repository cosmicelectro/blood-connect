import List "mo:core/List";
import DonorLib "../lib/donor";
import DonorTypes "../types/donor";
import Common "../types/common";

mixin (donors : List.List<DonorTypes.DonorProfile>) {

  public shared ({ caller }) func registerDonor(
    name : Text,
    address : Text,
    bloodType : Text,
    phone : Text,
    lat : Float,
    lng : Float,
  ) : async Common.Result<(), Text> {
    DonorLib.registerDonor(donors, caller, name, address, bloodType, phone, lat, lng);
  };

  public shared ({ caller }) func updateDonorProfile(
    name : Text,
    address : Text,
    phone : Text,
    lat : Float,
    lng : Float,
  ) : async Common.Result<(), Text> {
    DonorLib.updateDonorProfile(donors, caller, name, address, phone, lat, lng);
  };

  public shared query ({ caller }) func getMyProfile() : async ?DonorTypes.DonorPublicView {
    switch (DonorLib.findDonor(donors, caller)) {
      case null { null };
      case (?d) { ?DonorLib.toPublicView(d, d.lat, d.lng) };
    };
  };

  public shared ({ caller }) func logDonation() : async Common.Result<(), Text> {
    DonorLib.logDonation(donors, caller);
  };

  public func checkAndUpdateAvailability() : async () {
    DonorLib.refreshAvailability(donors);
  };

  // Update call — auto-refreshes availability before returning results
  public shared func searchDonors(
    bloodType : Text,
    seekerLat : Float,
    seekerLng : Float,
  ) : async [DonorTypes.DonorPublicView] {
    DonorLib.searchDonors(donors, bloodType, seekerLat, seekerLng);
  };

  public query func getAllDonors() : async [DonorTypes.DonorPublicView] {
    DonorLib.getAllDonors(donors);
  };
};
