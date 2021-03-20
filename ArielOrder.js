const Order = require("./Order");

const OrderState = Object.freeze({
  WELCOMING: Symbol("welcoming"),
  AMOUNT: Symbol("amount"),
  KIND: Symbol("kind"),
  DRINKS: Symbol("drinks"),
  // 2nd item
  QUALITY: Symbol("quality"),
  CREAM: Symbol("cream"),
  SECONDDRINK: Symbol("secondDrink"),
  // payment
  PAYMENT: Symbol("payment")
});

module.exports = class ArielOrder extends Order {
  constructor(sNumber, sUrl) {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sAmount = "";
    this.sKind = "";
    this.sDrinks = "";
    this.sItem = "muffin(s)";
    //2nd item
    this.sQuality = "";
    this.sCream = "";
    this.sSecondDrink = "";
    this.sSecondItem = "scone(s)";
  }
  handleInput(sInput) {
    let aReturn = [];
    switch (this.stateCur) {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.AMOUNT;
        aReturn.push("Welcome to Ariel's Dessert Bar.");
        aReturn.push("How many muffins would you like?");
        break;
      case OrderState.AMOUNT:
        var a = Number(sInput);
        if (isNaN(a) == false) {
          this.stateCur = OrderState.KIND
          this.sAmount = sInput;
          aReturn.push("What kind of muffin would you like?");
          // console.log(`${a} muffins`);
        }else{
          aReturn.push("please enter an Arabic numerals: ");}
        break;
      case OrderState.KIND:
        this.stateCur = OrderState.DRINKS
        this.sKind = sInput;
        aReturn.push("Any drinks with that?");
        break;
      // 2nd item
      case OrderState.DRINKS:
        if (sInput.toLowerCase() == 'yes'){
          aReturn.push("We got coffee and tea, which one would you like?")
        }
        else if (sInput.toLowerCase() == 'coffee' || sInput.toLowerCase() == 'tea'|| sInput.toLowerCase() == 'no'){
          this.stateCur = OrderState.QUALITY;
          this.sDrinks = sInput;
          aReturn.push("Do you like scones with this order as well?");
          aReturn.push("How many scones would you like?");
        }else{
          aReturn.push("We got COFFEE and TEA, any one?")
        }
        break;
      case OrderState.QUALITY:
        var b = Number(sInput);
        if (isNaN(b) == false) {
          this.stateCur = OrderState.CREAM;
          this.sQuality = sInput;
          aReturn.push("Cream on the side with your order?");
        }else{
          aReturn.push("please enter an Arabic numerals: ");}
        break;
      case OrderState.CREAM:
        this.stateCur = OrderState.SECONDDRINK;
        if (sInput.toLowerCase() != "no") {
          this.sCream = sInput;
        }
        aReturn.push("Another drink?");
        break;
      case OrderState.SECONDDRINK:
        if (sInput.toLowerCase() == 'yes'){
          aReturn.push("We got coffee and tea, which one would you like?")
        }
        else if (sInput.toLowerCase() == 'coffee' || sInput.toLowerCase() == 'tea'|| sInput.toLowerCase() == 'no'){
          this.sSecondDrink = sInput;
          this.stateCur = OrderState.PAYMENT;
          aReturn.push("Thank you for your order of");
          aReturn.push(`${this.sAmount} ${this.sKind} ${this.sItem}`);
          if (this.sDrinks) {
            aReturn.push(`with ${this.sDrinks} drink for the first meal.`);
          }
          // 2nd meal receipt
          aReturn.push("Second meal for you is");
          aReturn.push(`${this.sQuality} ${this.sSecondItem}`);
          if (this.sCream) {
            aReturn.push(`with cream on the side.`);
          }
          if (this.sSecondDrink) {
            aReturn.push(`plus ${this.sSecondDrink} drink.`);
          }
          // price estimation
          if (this.sDrinks.toLowerCase() != 'no' ) {
            this.sDrinks = 1;
          }
          if (this.sSecondDrink.toLowerCase() != 'no') {
            this.sSecondDrink = 1;
          }
          var PRICE = this.sAmount * 5 + this.sQuality * 7 + this.sDrinks * 4 + this.sSecondDrink * 4
          aReturn.push(`Total is CAD $${PRICE}`);
          aReturn.push(`Please pay for your order here`);
          this.nOrder = PRICE;
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
        }else{
          aReturn.push("We got COFFEE and TEA, any one?");}
        break;
      case OrderState.PAYMENT:
        console.log(sInput);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Payment Succeed! Your order will be delivered at ${d.toTimeString()}`);
        aReturn.push(`Your order will be delivered at: ${Object.values(sInput.purchase_units[0].shipping.address)}`);
        break;
    }
    return aReturn;
  }
  renderForm() {
    // your client id should be kept private
    const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
    
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}