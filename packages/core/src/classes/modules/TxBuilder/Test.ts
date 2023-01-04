// @ts-nocheck

let builder = blah();

// SUNDAE -> ADA -> NEWM
// Tx:
//   Output:
//     EscrowAddr, Datum: {
//       Destination: {
//         Address: EscrowAddr
//         Datum: { ... } // The datum for the ADA/NEWM order
//         alternate: myAddress
//       },
//       ScoopFee:
//       Action: {
//         ... // The datum for the SUNDAE->ADA order
//       }
//     }

builder.buildRaw(
  "00",
  new Something(
    // Where to send the funds after the order executes
    new Destination(
      // The address to send the result of the order to
      address, // Could be a script address
      /// (optional) datum hash to attach to the result
      new Datum({}) // we'll compute the hash
    ),
    // An (optional) alternate address that is allowed to cancel the transaction
    null | "addr1..."
  ),
  // How much ada to pay the scoopers; note less than 2.5 ada will be ignroed
  ScoopFee
  //
  // new Swap(),
  // new Deposit(),
  // new Zap(),
  // new Withdrawal(),
);

builder.swap(sdk.find("SUNDAE", "ADA", 0.05));
builder.marketBuy();
builder.marketSell();
builder.limitBuy();
builder.limitSell();
builder.deposit();
builder.zap();
builder.withdraw();
builder.cancel();
builder.createPool();

builder.chained().swap("addr1", 100).then_swap("addr2");

// yield farming
builder.freeze();
builder.unfreeze();

export {};
