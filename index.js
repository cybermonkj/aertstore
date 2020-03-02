const contractSource = `
contract aertstore =

  record post = 
    { creatorAddress : address,
      url            : string,
      nameofpost  : string,
      currentPrice   : int,
      description  : string,
      sold           : bool,
      reviews        : int}

  record state = 
    { posts : map(int, post),
      postLength : int,
      bidders : map(int,address),
      bidderLength : int }

  entrypoint init() = 
    { posts = {}, 
      postLength = 0,
      bidders = {},
      bidderLength = 0 }

  entrypoint getpost(index:int) : post = 
    switch(Map.lookup(index, state.posts))
      None => abort("post does not exist with this index")
      Some(x) => x  

  stateful entrypoint registerpost(url' : string, nameofpost': string, description' : string, currentPrice': int) =
    let post = { creatorAddress = Call.caller, url = url', nameofpost = nameofpost', currentPrice = currentPrice', description = description', sold = false, reviews = state.bidderLength}  
    let index = getpostLength() + 1 
    put(state{posts[index] = post, postLength  = index})


  entrypoint getpostLength() : int = 
    state.postLength



  //bid functionality

  payable stateful entrypoint bid(index: int) =
    let post = getpost(index)
    let addresses = Call.caller
    let updatedBid = Call.value
    let contractBalance = getContractBalance()
    put(state{bidders[index]= addresses})
    
    biddingSecurity()

    


    if(post.sold == true)
      abort("post has been sold")
      
    //first bid
    //if(Call.value > post.currentPrice &&  contractBalance == 0)
      //Chain.spend(Contract.address, Call.value)
    
    
      //second bid
    //if(Call.value > post.currentPrice && contractBalance != 0)
      //let previousbidder = getBidderAddress(index)
      //Chain.spend(previousbidder,Contract.balance)
  
    //elif(Call.value < updatedBid)
      //abort("your bid is lower than the current bid")
    //else
      //abort("you need to enter a value higher than 0 ")
    let updatedpost = state.posts{ [index].currentPrice = updatedBid}
    let index = getBidderLength() + 1


    put(state { posts = updatedpost})
    
    put(state{bidderLength = index})


  //length of registered bidders
  entrypoint getBidderLength() : int = 
    state.bidderLength   


  //stores address of registered bidsers

  entrypoint getBidderAddress(index:int) = 
    switch(Map.lookup(index, state.bidders))
      None => abort("bidder does not exist with this index")
      Some(x) => x 

  // stateful entrypoint bidders(name:string)  = 
  // let bidder = { bidderAddress = Call.caller, updatedPrice = Call.value, name = name }
  //let index = getBidderLength() + 1
  //put(state{bidders[index] = bidders, bidderLength  = index})
  //put(state{bidders[index] = bidders, bidders  = bidder})

  stateful entrypoint closeBid(index : int) = 
    put(state{posts[index].sold = true})
    let post = getpost(index)
    let total = Contract.balance
    let creatorsAddress = post.creatorAddress
    Chain.spend(creatorsAddress: address, post.currentPrice: int)


  public entrypoint getContractBalance() : int =
    Contract.balance

  public entrypoint getContractowner() : address =
    Contract.creator

  stateful entrypoint biddingSecurity() = 
    if(Call.caller == Contract.creator)
      abort("you cannot bid on your own post")`; 


const contractAddress = 'ct_cZozTq3weMiSgHDEzCPB9hwFC9YchNrEA2yjHSaLgstMXZE2Z';
var postArray = [];
var client = null;
var postLength = 0;



function renderpost()
{
    postArray = postArray.sort(function(a,b){return b.Price - a.Price})
    var template = $('#template').html();
    
    Mustache.parse(template);
    var rendered = Mustache.render(template, {postArray});

    
  

    $('#postBody').html(rendered);
    console.log("for loop reached")
}
//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  console.log("Contract : ", contract)
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  console.log("Called get found: ",  calledGet)
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("catching errors : ", decodedGet)
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount:value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
  $("#loadings").show();

  client = await Ae.Aepp()

  postLength = await callStatic('getpostLength', []); 

  function makeTimer() {

    //		var endTime = new Date("29 April 2018 9:56:00 GMT+01:00");	
      var endTime = new Date("29 October 2019 9:56:00 GMT+01:00");			
        endTime = (Date.parse(endTime) / 1000);
  
        var now = new Date();
        now = (Date.parse(now) / 1000);
  
        var timeLeft = endTime - now;
  
        var days = Math.floor(timeLeft / 86400); 
        var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
        var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
        var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
    
        if (hours < "10") { hours = "0" + hours; }
        if (minutes < "10") { minutes = "0" + minutes; }
        if (seconds < "10") { seconds = "0" + seconds; }
  
        initialdays = $("#days").html(days + "<span>Days</span>");
        initialhours = $("#hours").html(hours + "<span>Hours</span>");
        initialminutes = $("#minutes").html(minutes + "<span>Minutes</span>");
        initialseconds = $("#seconds").html(seconds + "<span>Seconds</span>");		
  
    }
  
    setInterval(function() { makeTimer(); }, 1000);
  for(let i = 1; i< postLength + 1; i++ ){
    const post =  await callStatic('getpost', [i]);
    
    console.log("for loop reached")
    

    postArray.push({
      sold : post.sold,
      url : post.url,
      index : i,
      postNames : post.nameofpost,
      Price : post.currentPrice ,
      review : post.reviews,

      days : initialdays,
      hours : initialhours,
      minutes : initialminutes,
      seconds : initialseconds
  })
}
  renderpost();
  $("#loadings").hide();
});

// document.getElementById("bidButton").addEventListener('click', function(event){
//     console.log(document.getElementById("input").value)
// });

$("#postBody").on("click", ".bidButton", async function(event){
  $("#loadings").show();
    // var review = 0;
    const dataIndex = event.target.id;
    const foundIndex = postArray.findIndex(post => post.index == dataIndex);
    const value = $(".bid")[foundIndex].value ;


    
    await contractCall('bid', [dataIndex], Math.abs(value));
    
    
    console.log("the value",value);
    console.log(typeof value);

    postArray[foundIndex].Price += parseInt(Math.abs(value),10);
    postArray[foundIndex].review += 1 ;
    
    
    // post.review += 1;
    renderpost();

  //   postArray.push({
  //     review : review
  // })

    $("#loadings").hide();
});

// $(document).ready(function(){
//     $("#postBody").on("click", ".bidButton", async function(event){
//         const value = parseInt($(".bid").val()) ;
//         console.log(value)
//         console.log(typeof value)
//         // event.preventDefault();

//     })
//   });

$('#regButton').click(async function(){
  $("#loadings").show();

    var name =($('#sellerName').val()),
    price = parseInt(($('#regPrice').val()),10),
    url = ($('#regUrl').val()),
    postName = ($('#regName').val());
    description = ($('#postDescription').val());
    await contractCall('registerpost', [url,postName,description,price])
    console.log(name),

    function makeTimer() {

      //		var endTime = new Date("29 April 2018 9:56:00 GMT+01:00");	
        var endTime = new Date("29 October 2019 9:56:00 GMT+01:00");			
          endTime = (Date.parse(endTime) / 1000);
    
          var now = new Date();
          now = (Date.parse(now) / 1000);
    
          var timeLeft = endTime - now;
    
          var days = Math.floor(timeLeft / 86400); 
          var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
          var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
          var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));
      
          if (hours < "10") { hours = "0" + hours; }
          if (minutes < "10") { minutes = "0" + minutes; }
          if (seconds < "10") { seconds = "0" + seconds; }
    
          days = $("#days").html(days + "<span>Days</span>");
          hours = $("#hours").html(hours + "<span>Hours</span>");
          minutes = $("#minutes").html(minutes + "<span>Minutes</span>");
          seconds = $("#seconds").html(seconds + "<span>Seconds</span>");		
    
      }
    
      setInterval(function() { makeTimer(); }, 1000);

    

    
    postArray.push({
        name : name,
        url : url,
        index : postArray.length + 1,
        postName : postName,
        description : description,

        Price : price ,
        review : postArray.reviews,
        days : postArray.days,
        hours : postArray.hours,
        minutes : postArray.minutes,
        seconds : postArray.seconds
        
    })
    renderpost();
    $("#loadings").hide();
});