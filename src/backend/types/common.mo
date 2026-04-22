module {
  public type Result<T, E> = { #ok : T; #err : E };
  public type Timestamp = Int; // nanoseconds since epoch (Time.now())
};
