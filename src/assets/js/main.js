  // function onClick(){
  document.addEventListener('DOMContentLoaded',()=>{

const inward=document.querySelector("#inward");
const outward=document.querySelector("#outward");



document.querySelector('#linkInward').addEventListener("click",e =>{
 e.preventDefault();
 
inward.style.display="inherit";

outward.style.display="none";

})

document.querySelector('#linkOutward').addEventListener("click",e =>{
e.preventDefault();     

outward.style.display="inherit";
inward.style.display="none";

})

$('body').prepend('<a href="body" class="back-to-top page-scroll">Back to Top</a>');
var amountScrolled = 700;
$(window).scroll(function() {
    if ($(window).scrollTop() > amountScrolled) {
        $('a.back-to-top').fadeIn('500');
    } else {
        $('a.back-to-top').fadeOut('500');
    }
})(jQuery);

});
// }

