$(function(){
});

var send = 0;

$(document).on("click", "#sendbox", function(){
    var usermessage = $(".userquery").val();
    if(usermessage.trim()!="" && !send){
        send=1;
        $(".userquery").submit();
        $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-user\"><div class=\"inner-message\"><p>"+usermessage.trim()+"</p></div></div></div>");
        $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
        executeFunction(false);
        $(".userquery").val("");
        $(".botimg:last").css({
            "-moz-animation-name":"rotatebox",
            "-moz-animation-duration":"0.8s",
            "-moz-animation-iteration-count":"1",
            "-moz-animation-fill-mode":"forwards",

            //for safari & chrome
            "-webkit-animation-name":"rotatebox",
            "-webkit-animation-duration":"0.8s",
            "-webkit-animation-iteration-count":"1",
            "-webkit-animation-fill-mode" : "forwards",
            
            "animation-name":"rotatebox",
            "animation-duration":"0.8s",
            "animation-iteration-count":"1",
            "animation-fill-mode" : "forwards"            
        });
    }
})
               
$(document).on("keydown", "textarea", function(e){
    if (e.keyCode == 13 && !e.shiftKey) {         
        e.preventDefault();
        var submitbtn = document.getElementById("sendbox");
        submitbtn.click();
    }
})

function watson(data) {
    send=0;
    var watsonmessage = data;
    $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-bot\"><img class=\"botimg\" src=\"bot.png\"><div class=\"inner-message\"><p>"+watsonmessage+"</p></div></div></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
}

function courseblock(coursedata,val){
    send=0;
    var pdata = $.parseJSON(coursedata);
    var len = val+10; if(len>pdata.docs.length) len = pdata.docs.length;
    var watsonmessage = "Showing "+(val/10*10+1)+"-"+len+" results out of " +(pdata.docs.length)+ " results. If you want to view more, tell me."; 
    $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-bot\"><img class=\"botimg\" src=\"bot.png\"><div class=\"inner-message\"><p>"+watsonmessage+"</p></div></div></div>");
    for(var i=val; i<pdata.docs.length && i<val+10; i++){
        $(".inner-message:last").append("<a href=\""+pdata.docs[i].url+"\"><span class=\"coursebox\">"+pdata.docs[i].course+"</span></a>");
    }
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
    if(val+10 < pdata.docs.length) return val+10;
    else return 0;
}

function courseinfo(userinfo, data) {
    send=0;
    var pdata = $.parseJSON(data);
    console.log(JSON.stringify(pdata,null,2));
    var watsonmessage = "Here are the information you need about " + userinfo.course + ".";
    $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-bot\"><img class=\"botimg\" src=\"bot.png\"><div class=\"inner-message\"><p>"+watsonmessage+"</p></div></div></div>");
    var getAttri=[1,0,0,0,0,0,0,0,0,0,0];
    for(var i=0; i<userinfo.attribute.length; i++){
        if(userinfo.attribute[i]=="course") getAttri[0]=1;
        if(userinfo.attribute[i]=="professor")getAttri[1]=1;
        if(userinfo.attribute[i]=="time") getAttri[2]=1;
        if(userinfo.attribute[i]=="category") getAttri[3]=1;
        if(userinfo.attribute[i]=="weight") getAttri[4]=1;
        if(userinfo.attribute[i]=="credit") getAttri[5]=1;
        if(userinfo.attribute[i]=="pnp") getAttri[6]=1;
        if(userinfo.attribute[i]=="url") getAttri[7]=1;
        if(userinfo.attribute[i]=="mileage") getAttri[8]=1;
        if(userinfo.attribute[i]=="rating") getAttri[9]=1;
    }
    console.log(pdata.docs[0].course);
    for(var i=0; i<pdata.docs.length; i++){
        $(".inner-message:last").append("<span class=\"courseinfobox\"><p>Course name: "+pdata.docs[i].course+"</p>");
        if(getAttri[1]) $("p:last").after("<p>Professor: "+pdata.docs[i].professor+"</p>");
        if(getAttri[3]) $("p:last").after("<p>Category: "+pdata.docs[i].category.college+ ", " +pdata.docs[i].category.major+ "</p>");
        if(getAttri[2]) $("p:last").after("<p>Time: "+pdata.docs[i].time+"</p>");
        if(getAttri[4]) $("p:last").after("<p>Weight: "+pdata.docs[i].weight+"</p>");
        if(getAttri[5]) $("p:last").after("<p>Credit: "+pdata.docs[i].credit+"</p>");
        if(getAttri[6]) $("p:last").after("<p>P/NP: "+pdata.docs[i].pnp+"</p>");
        if(getAttri[8]) $("p:last").after("<p>Mileage cut: "+pdata.docs[i].mileage+"</p>");
        if(getAttri[9]) $("p:last").after("<p>Rating: "+pdata.docs[i].rating+" star points</p>");
        if(getAttri[7]) $("p:last").append("<p>Syllabus(link): <a href=\""+pdata.docs[i].url+"\">" +pdata.docs[i].url+ "</a></p>");
        $("p:last").after("</span>");
    }
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
}

function categorizing(data){
    send=0;
    var pdata = $.parseJSON(data);
    var watsonString = "";
    watsonString += pdata.docs[0].major[0];
    for(var i=1; i<pdata.docs[0].major.length; i++){
        watsonString += ", " + pdata.docs[0].major[i];
    }
    $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-bot\"><img class=\"botimg\" src=\"bot.png\"><div class=\"inner-message\"><p>There are " + watsonString + " in " + pdata.docs[0].college + ".</p></div></div></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
}

function mileageinfo(guess, data) {
    send=0;
    var pdata = $.parseJSON(data);
    var suitability;
    for(var i=0;i<pdata.docs.length;i++) {
      var real = pdata.docs[i].mileage;
      if(guess>=real+6) suitability = "too much"; //과잉
      else if(guess>=real+2) suitability = "sufficient"; //안정 적합
      else if(guess>=real-2) suitability= "slightly short but enough"; //불안 적합
      else suitability= "insufficient"; //부적합
      $("#chatlog").append("<div class=\"chat-load\"><div class=\"from-bot\"><img class=\"botimg\" src=\"bot.png\"><div class=\"inner-message\"><p>I think " + guess + " mileage point is " + suitability + " if you mean " + pdata.docs[i].course + " by " + pdata.docs[i].professor + " on " + pdata.docs[i].time + ". The mileage cut in 2016-1 was " + real + ".</p></div></div></div>");
    }
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight);
}