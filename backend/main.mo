import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type ItemId = Nat;
  type BillId = Nat;
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
    id : BillId;
    date : Text;
    studentName : Text;
    items : [BillItem];
    grandTotal : Float;
    paymentMode : PaymentMode;
  };

  module InventoryItem {
    public func compare(bill1 : InventoryItem, bill2 : InventoryItem) : Order.Order {
      switch (Text.compare(bill1.name, bill2.name)) {
        case (#equal) { Text.compare(bill1.category, bill2.category) };
        case (order) { order };
      };
    };
  };

  var nextItemId = 0;
  var nextBillId = 0;

  let inventory = Map.empty<ItemId, InventoryItem>();
  let bills = Map.empty<BillId, BillRecord>();

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

  // Automatically update stock totals after successful bill addition
  public shared ({ caller }) func createBill(studentName : Text, items : [BillItem], paymentMode : PaymentMode) : async BillId {
    let billId = nextBillId;
    nextBillId += 1;

    for (item in items.values()) {
      updateInventoryItem(item.itemId, item.quantity);
    };

    let grandTotal = switch (items.size()) {
      case (0) { 0.0 };
      case (_) {
        let iter = items.values();
        iter.foldLeft(0.0, func(acc, item) { acc + item.subtotal });
      };
    };

    let billRecord : BillRecord = {
      id = billId;
      date = "2023-10-10";
      studentName;
      items;
      grandTotal;
      paymentMode;
    };

    bills.add(billId, billRecord);
    billId;
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
};
