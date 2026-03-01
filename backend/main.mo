import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";



actor {
  type ItemId = Nat;
  type BillNumber = Nat;
  type PaymentMode = { #cash; #upi };
  type ItemCategory = Text;

  public type InventoryItem = {
    id : ItemId;
    name : Text;
    category : ItemCategory;
    quantity : Nat;
    pricePerItem : Float;
  };

  public type BillItem = {
    itemId : ItemId;
    itemName : Text;
    quantity : Nat;
    subtotal : Float;
  };

  public type BillRecord = {
    number : BillNumber;
    date : Text;
    studentName : Text;
    studentClass : Text;
    items : [BillItem];
    grandTotal : Float;
    paymentMode : PaymentMode;
  };

  module InventoryItem {
    public func compare(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      switch (Text.compare(item1.name, item2.name)) {
        case (#equal) { Text.compare(item1.category, item2.category) };
        case (order) { order };
      };
    };
  };

  var nextItemId = 0;
  var nextBillNumber = 1;

  let inventory = Map.empty<ItemId, InventoryItem>();
  let bills = Map.empty<BillNumber, BillRecord>();

  public shared ({ caller }) func addItem(name : Text, category : ItemCategory, quantity : Nat, pricePerItem : Float) : async ItemId {
    let itemId = nextItemId;
    nextItemId += 1;

    let newItem : InventoryItem = {
      id = itemId;
      name;
      category;
      quantity;
      pricePerItem;
    };

    inventory.add(itemId, newItem);
    itemId;
  };

  public shared ({ caller }) func updateItem(itemId : ItemId, name : Text, category : ItemCategory, quantity : Nat, pricePerItem : Float) : async () {
    let updatedItem : InventoryItem = {
      id = itemId;
      name;
      category;
      quantity;
      pricePerItem;
    };
    inventory.add(itemId, updatedItem);
  };

  public query ({ caller }) func getItems() : async [InventoryItem] {
    inventory.values().toArray().sort();
  };

  public shared ({ caller }) func createBill(studentName : Text, studentClass : Text, items : [BillItem], paymentMode : PaymentMode, istDate : Text) : async BillNumber {
    if (items.size() == 0) {
      Runtime.trap("Bill must have at least 1 item.");
    };

    for (item in items.values()) {
      updateInventoryItem(item.itemId, item.quantity);
    };

    let grandTotal = items.values().foldLeft(0.0, func(acc, item) { acc + item.subtotal });

    let billNumber = nextBillNumber;
    nextBillNumber += 1;

    let billRecord : BillRecord = {
      number = billNumber;
      date = istDate;
      studentName;
      studentClass;
      items;
      grandTotal;
      paymentMode;
    };

    bills.add(billNumber, billRecord);
    billNumber;
  };

  func updateInventoryItem(itemId : ItemId, quantitySold : Nat) {
    let item = inventory.get(itemId);

    switch (item) {
      case (?existingItem) {
        checkStock(existingItem, quantitySold);
        let updatedItem : InventoryItem = { existingItem with quantity = existingItem.quantity - quantitySold };
        inventory.add(itemId, updatedItem);
      };
      case (null) { Runtime.trap("Item not found") };
    };
  };

  func checkStock(item : InventoryItem, quantitySold : Nat) {
    if (item.quantity < quantitySold) {
      Runtime.trap("Insufficient stock for item " # item.name # ". Current stock: " # item.quantity.toText());
    };
  };

  public query ({ caller }) func getBillsByDate(date : Text) : async [BillRecord] {
    bills.values().toArray().filter(func(bill) { bill.date == date });
  };

  public query ({ caller }) func getTotals() : async {
    totalItems : Nat;
    totalStockAvailable : Nat;
    totalStockSoldToday : Nat;
    totalIncomeToday : Float;
  } {
    let totalStockAvailable = 0;
    let totalStockSoldToday = 0;
    let totalIncomeToday = 0.0;

    {
      totalItems = inventory.size();
      totalStockAvailable;
      totalStockSoldToday;
      totalIncomeToday;
    };
  };

  public query ({ caller }) func getNextBillNumber() : async Nat {
    nextBillNumber;
  };
};
