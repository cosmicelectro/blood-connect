import List "mo:core/List";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Types "../types/donor";
import Common "../types/common";

module {
  // 4 months in nanoseconds: 4 * 30 * 24 * 60 * 60 * 1_000_000_000
  public let FOUR_MONTHS_NS : Int = 10_368_000_000_000_000;

  public func bloodTypeFromText(t : Text) : ?Types.BloodType {
    switch (t) {
      case "A+" { ?#APos };
      case "A-" { ?#ANeg };
      case "B+" { ?#BPos };
      case "B-" { ?#BNeg };
      case "AB+" { ?#ABPos };
      case "AB-" { ?#ABNeg };
      case "O+" { ?#OPos };
      case "O-" { ?#ONeg };
      case _ { null };
    };
  };

  public func bloodTypeToText(bt : Types.BloodType) : Text {
    switch (bt) {
      case (#APos) "A+";
      case (#ANeg) "A-";
      case (#BPos) "B+";
      case (#BNeg) "B-";
      case (#ABPos) "AB+";
      case (#ABNeg) "AB-";
      case (#OPos) "O+";
      case (#ONeg) "O-";
    };
  };

  public func computeIsAvailable(lastDonationDate : ?Int) : Bool {
    switch (lastDonationDate) {
      case null { true };
      case (?d) {
        let elapsed : Int = Time.now() - d;
        elapsed >= FOUR_MONTHS_NS;
      };
    };
  };

  // Haversine formula returns distance in kilometres
  public func haversineKm(lat1 : Float, lng1 : Float, lat2 : Float, lng2 : Float) : Float {
    let r : Float = 6371.0; // Earth radius in km
    let dLat = (lat2 - lat1) * (Float.pi / 180.0);
    let dLng = (lng2 - lng1) * (Float.pi / 180.0);
    let a = Float.sin(dLat / 2.0) * Float.sin(dLat / 2.0)
      + Float.cos(lat1 * (Float.pi / 180.0)) * Float.cos(lat2 * (Float.pi / 180.0))
        * Float.sin(dLng / 2.0) * Float.sin(dLng / 2.0);
    let c = 2.0 * Float.arctan(Float.sqrt(a) / Float.sqrt(1.0 - a));
    r * c;
  };

  public func toPublicView(d : Types.DonorProfile, seekerLat : Float, seekerLng : Float) : Types.DonorPublicView {
    {
      id = d.id.toText();
      name = d.name;
      address = d.address;
      bloodType = bloodTypeToText(d.bloodType);
      phone = d.phone;
      isAvailable = d.isAvailable;
      distanceKm = haversineKm(seekerLat, seekerLng, d.lat, d.lng);
      lat = d.lat;
      lng = d.lng;
    };
  };

  // Returns the existing donor for the caller, or null
  public func findDonor(donors : List.List<Types.DonorProfile>, caller : Principal) : ?Types.DonorProfile {
    donors.find(func(d) { d.id == caller });
  };

  public func registerDonor(
    donors : List.List<Types.DonorProfile>,
    caller : Principal,
    name : Text,
    address : Text,
    bloodType : Text,
    phone : Text,
    lat : Float,
    lng : Float,
  ) : Common.Result<(), Text> {
    switch (findDonor(donors, caller)) {
      case (?_) { #err("Donor already registered") };
      case null {
        switch (bloodTypeFromText(bloodType)) {
          case null { #err("Invalid blood type") };
          case (?bt) {
            let profile : Types.DonorProfile = {
              id = caller;
              var name = name;
              var address = address;
              bloodType = bt;
              var phone = phone;
              var lat = lat;
              var lng = lng;
              var lastDonationDate = null;
              var isAvailable = true;
            };
            donors.add(profile);
            #ok(());
          };
        };
      };
    };
  };

  public func updateDonorProfile(
    donors : List.List<Types.DonorProfile>,
    caller : Principal,
    name : Text,
    address : Text,
    phone : Text,
    lat : Float,
    lng : Float,
  ) : Common.Result<(), Text> {
    switch (findDonor(donors, caller)) {
      case null { #err("Donor not found") };
      case (?d) {
        d.name := name;
        d.address := address;
        d.phone := phone;
        d.lat := lat;
        d.lng := lng;
        #ok(());
      };
    };
  };

  public func logDonation(
    donors : List.List<Types.DonorProfile>,
    caller : Principal,
  ) : Common.Result<(), Text> {
    switch (findDonor(donors, caller)) {
      case null { #err("Donor not found") };
      case (?d) {
        d.lastDonationDate := ?Time.now();
        d.isAvailable := false;
        #ok(());
      };
    };
  };

  // Iterate all donors and flip isAvailable=true for eligible ones
  public func refreshAvailability(donors : List.List<Types.DonorProfile>) : () {
    donors.forEach(func(d) {
      if (not d.isAvailable) {
        if (computeIsAvailable(d.lastDonationDate)) {
          d.isAvailable := true;
        };
      };
    });
  };

  public func searchDonors(
    donors : List.List<Types.DonorProfile>,
    bloodTypeFilter : Text,
    seekerLat : Float,
    seekerLng : Float,
  ) : [Types.DonorPublicView] {
    refreshAvailability(donors);
    let filtered = donors.filter(func(d) {
      if (bloodTypeFilter == "") { true }
      else { bloodTypeToText(d.bloodType) == bloodTypeFilter };
    });
    let views = filtered.map<Types.DonorProfile, Types.DonorPublicView>(
      func(d) { toPublicView(d, seekerLat, seekerLng) }
    );
    let arr = views.toArray();
    arr.sort<Types.DonorPublicView>(func(a, b) {
      if (a.distanceKm < b.distanceKm) { #less }
      else if (a.distanceKm > b.distanceKm) { #greater }
      else { #equal };
    });
  };

  public func getAllDonors(donors : List.List<Types.DonorProfile>) : [Types.DonorPublicView] {
    refreshAvailability(donors);
    let views = donors.map<Types.DonorProfile, Types.DonorPublicView>(
      func(d) { toPublicView(d, 0.0, 0.0) }
    );
    views.toArray();
  };
};
