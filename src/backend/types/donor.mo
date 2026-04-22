module {
  public type BloodType = {
    #APos; #ANeg; #BPos; #BNeg; #ABPos; #ABNeg; #OPos; #ONeg;
  };

  // Internal mutable record stored in the List
  public type DonorProfile = {
    id : Principal;
    var name : Text;
    var address : Text;
    bloodType : BloodType;
    var phone : Text;
    var lat : Float;
    var lng : Float;
    var lastDonationDate : ?Int; // nullable nanosecond timestamp
    var isAvailable : Bool;
  };

  // Shared (immutable) public view returned to callers
  public type DonorPublicView = {
    id : Text;      // principal as text
    name : Text;
    address : Text;
    bloodType : Text;
    phone : Text;
    isAvailable : Bool;
    distanceKm : Float;
    lat : Float;
    lng : Float;
  };
};
