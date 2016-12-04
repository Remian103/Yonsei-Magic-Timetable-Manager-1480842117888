$(function(){
});


var chk_toggle=false;

$(window).resize(function(){
    if($("#sidebar_query").css("visibility")=="hidden"){
        $("#sidebar_query").css("display", "none");
        $(".nextimg").css("left", "0");
        chk_toggle= false;
    }
   }
)

$( document ).on("click", ".nextimg", (function() {        
    if(chk_toggle){
                $("#sidebar_query").hide("slide", {direction: "left"}, 500);
                $(".nextimg").animate({"left":"0"}, 500);
                chk_toggle=false;
            }
            else{
                $("#sidebar_query").show("slide", {direction: "left"}, 500);
                $(".nextimg").animate({"left":"12%", "z-index" : "100"}, 500);
                chk_toggle=true;
            }    
}                                      
));