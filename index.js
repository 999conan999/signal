const Binance = require('node-binance-api');
const binance = new Binance().options({
  reconnect:true,
});
var RSI = require('technicalindicators').RSI;
const TelegramBot = require('node-telegram-bot-api');
const token = '5095801660:AAGoRAKOPnUrLcSowzAmkgGqjQxmxy8aka8';
const chatId=1497494659;
const bot = new TelegramBot(token, {polling: true});
var data_all=[];
main();
async function main(){
  let list_symbol=await get_symbols();
  get_data_socket(list_symbol);
}
//************End Main */
// Nguon cung cap data here
  async function get_data_socket(list_symbol){
    try{

      binance.futuresChart(list_symbol, '4h', (symbol, interval, chart) => {
          let array_data=[];
          Object.keys(chart).forEach(function(key) {
            array_data.push(chart[key].close);
          })
          //
          data_all[symbol]={
            list_close:array_data,
          };
          ///    
      },15);

    }catch(e){
      console.log('loi tai get_data_socket');
      console.log(e);
    }
  }
  //************************ */
  async function get_symbols(){
    let rs=[];
    let prevDay= await binance.futuresPrices()
      // if(symbol.indexOf(basic_name)>0){
      Object.keys(prevDay).forEach(function(symbol) {
        if(symbol.indexOf('USDT')>0&&symbol.indexOf('_')==-1&&symbol.indexOf('1000XECUSDT')==-1&&symbol.indexOf('1000SHIBUSDT')==-1){
          rs.push(symbol)
        }
      })
    return rs;
  }
////***************** */
setTimeout(()=>{
  control_rsi_and_send(data_all)
},65000)
setInterval(()=>{
  control_rsi_and_send(data_all)
},600000)

function control_rsi_and_send(data_all){
  let result_data='';
  Object.keys(data_all).forEach(function(symbol) {
    let array_close_prices=data_all[symbol].list_close;
    let rsi=RSI.calculate({values:array_close_prices,period : 14});
    if(rsi.length>0){
      let rsi0=rsi[0];
      if(rsi0<26){
        result_data+=`
+ ${symbol} : RSI= ${rsi0} 🚩.
`
      }
    }
  });
  if(result_data!=''){
    bot.sendMessage(chatId,result_data);
  }
}
//   }
