/* ALMA DE LUNA | Prototipo funcional
   Productos, carrito y favoritos de demostración. No procesa pagos reales. */
const products = [
  {id:1,name:"Aretes Aurora",category:"Aretes",price:129,symbol:"✧",tag:"MÁS VENDIDO",image:"img/aretes-aurora.jpg"},
  {id:2,name:"Aretes Siena",category:"Aretes",price:159,symbol:"❋",tag:"NUEVO",image:"img/aretes-siena.jpg"},
  {id:3,name:"Collar Luna",category:"Collares",price:249,symbol:"☾",tag:"FAVORITO",image:"img/collar-luna.jpg"},
  {id:4,name:"Collar Perla",category:"Collares",price:189,symbol:"◇",tag:"",image:"img/collar-perla.jpg"},
  {id:5,name:"Pulsera Aura",category:"Pulseras",price:149,symbol:"◎",tag:"",image:"img/pulsera-aura.jpg"},
  {id:6,name:"Pulsera Golden",category:"Pulseras",price:179,symbol:"✦",tag:"NUEVO",image:"img/pulsera-golden.jpg"},
  {id:7,name:"Anillo Celeste",category:"Anillos",price:119,symbol:"○",tag:"",image:"img/anillo-celeste.jpg"},
  {id:8,name:"Anillo Sol",category:"Anillos",price:139,symbol:"☼",tag:"",image:"img/anillo-sol.jpg"},
  {id:9,name:"Set Brillo",category:"Sets",price:329,symbol:"✧",tag:"SET",image:"img/set-brillo.jpg"},
  {id:10,name:"Set Elegance",category:"Sets",price:399,symbol:"❀",tag:"EXCLUSIVO",image:"img/set-elegance.jpg"}
];
const STORAGE = {cart:"adl_cart_v1",favorites:"adl_favorites_v1"};
const readStore = (key, fallback) => { try { const v=localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
let cart = readStore(STORAGE.cart, []);
let favorites = readStore(STORAGE.favorites, []);
let activeCategory = "Todos";
let toastTimer;
const $ = id => document.getElementById(id);
const money = n => n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const save = () => { localStorage.setItem(STORAGE.cart,JSON.stringify(cart)); localStorage.setItem(STORAGE.favorites,JSON.stringify(favorites)); };
function notify(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2300);}
function productCard(p){
  const liked=favorites.includes(p.id);
  return `<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.tag?`<span class="product-tag">${p.tag}</span>`:""}<button class="favorite-button ${liked?"is-favorite":""}" data-favorite="${p.id}" aria-label="Guardar ${p.name}">${liked?"♥":"♡"}</button></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-price">${money(p.price)}</div><button class="add-button" data-add="${p.id}">AGREGAR A MI BOLSA +</button></div></article>`;
}
function renderProducts(){
  const term=$("search-input").value.trim().toLowerCase();
  let list=products.filter(p=>(activeCategory==="Todos"||p.category===activeCategory)&&(`${p.name} ${p.category}`).toLowerCase().includes(term));
  const sort=$("sort-select").value;
  if(sort==="low")list.sort((a,b)=>a.price-b.price);
  if(sort==="high")list.sort((a,b)=>b.price-a.price);
  if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"es"));
  $("product-grid").innerHTML=list.map(productCard).join("");
  $("result-count").textContent=`${list.length} ${list.length===1?"producto":"productos"}`;
  $("no-results").classList.toggle("hidden",list.length!==0);
  renderFavorites();
}
function renderFavorites(){
  const list=products.filter(p=>favorites.includes(p.id));
  $("favorites-grid").innerHTML=list.map(productCard).join("");
  $("favorites-empty").classList.toggle("hidden",list.length>0);
}
function toggleFavorite(id){
  favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];
  save();renderProducts();notify(favorites.includes(id)?"Agregado a tus favoritos ♡":"Eliminado de favoritos");
}
function addToCart(id){
  const item=cart.find(p=>p.id===id);
  if(item)item.quantity+=1;else cart.push({id,quantity:1});
  save();renderCart();notify("Producto agregado a tu bolsa");
}
function changeQuantity(id,amount){
  const item=cart.find(p=>p.id===id);if(!item)return;
  item.quantity+=amount;if(item.quantity<=0)cart=cart.filter(p=>p.id!==id);
  save();renderCart();
}
function removeFromCart(id){cart=cart.filter(p=>p.id!==id);save();renderCart();notify("Producto eliminado");}
function cartDetails(){
  return cart.map(item=>{const p=products.find(x=>x.id===item.id);return p?{...p,quantity:item.quantity}:null;}).filter(Boolean);
}
function renderCart(){
  const items=cartDetails(),count=items.reduce((s,p)=>s+p.quantity,0),subtotal=items.reduce((s,p)=>s+p.price*p.quantity,0);
  const shipping=count===0?0:(subtotal>=699?0:59);
  $("bag-count").textContent=count;$("drawer-count").textContent=`(${count})`;
  $("cart-items").innerHTML=items.length?items.map(p=>`<div class="cart-row"><div class="cart-thumb">${p.symbol}</div><div><div class="cart-product-name">${p.name}</div><div class="cart-product-price">${money(p.price)} c/u</div><div class="quantity"><button data-qty="-1" data-id="${p.id}" aria-label="Disminuir">−</button><span>${p.quantity}</span><button data-qty="1" data-id="${p.id}" aria-label="Aumentar">+</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Eliminar">×</button></div>`).join(""):'<p class="empty-note">Tu bolsa está vacía. ¡Encuentra algo que te encante! ♡</p>';
  $("cart-subtotal").textContent=money(subtotal);$("shipping-cost").textContent=count===0?"—":shipping===0?"GRATIS":money(shipping);$("cart-total").textContent=money(subtotal+shipping);
  $("shipping-message").textContent=count===0?"Agrega productos para comenzar.":subtotal>=699?"¡Felicidades! Tu envío es gratis. ✨":`Te faltan ${money(699-subtotal)} para obtener envío gratis.`;
}
function openCart(){$("cart-drawer").classList.add("open");$("overlay").classList.add("visible");}
function closeCart(){$("cart-drawer").classList.remove("open");$("overlay").classList.remove("visible");}
function openCheckout(){
  if(cart.length===0){notify("Tu bolsa está vacía");return;}
  closeCart();$("checkout-modal").classList.remove("hidden");
}
function closeCheckout(){$("checkout-modal").classList.add("hidden");}
$("category-list").addEventListener("click",e=>{
  const btn=e.target.closest("[data-category]");if(!btn)return;
  activeCategory=btn.dataset.category;
  document.querySelectorAll(".filter-chip").forEach(b=>b.classList.toggle("selected",b===btn));
  renderProducts();
});
$("product-grid").addEventListener("click",handleProductClick);
$("favorites-grid").addEventListener("click",handleProductClick);
function handleProductClick(e){
  const fav=e.target.closest("[data-favorite]"),add=e.target.closest("[data-add]");
  if(fav)toggleFavorite(Number(fav.dataset.favorite));
  if(add)addToCart(Number(add.dataset.add));
}
$("search-input").addEventListener("input",renderProducts);
$("sort-select").addEventListener("change",renderProducts);
$("cart-items").addEventListener("click",e=>{
  const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");
  if(q)changeQuantity(Number(q.dataset.id),Number(q.dataset.qty));
  if(r)removeFromCart(Number(r.dataset.remove));
});
$("open-cart").onclick=openCart;$("close-cart").onclick=closeCart;$("overlay").onclick=closeCart;
$("checkout-button").onclick=openCheckout;$("close-checkout").onclick=closeCheckout;
$("checkout-form").addEventListener("submit",e=>{
  e.preventDefault();const data=new FormData(e.target);const name=data.get("name").trim();
  const orderId="ADL-"+Math.floor(100000+Math.random()*900000);
  closeCheckout();cart=[];save();renderCart();e.target.reset();
  notify(`¡Gracias, ${name}! Pedido de prueba ${orderId} generado.`);
});
$("search-focus").onclick=()=>{$("search-input").focus();$("catalogo").scrollIntoView({behavior:"smooth"});};
$("favorites-jump").onclick=()=>$("favoritos").scrollIntoView({behavior:"smooth"});
$("mobile-menu").onclick=()=>$("main-nav").classList.toggle("open");
document.querySelectorAll("#main-nav a").forEach(a=>a.addEventListener("click",()=>$("main-nav").classList.remove("open")));
renderProducts();renderCart();

// CHATBOT LUNA: respuestas fijas programadas en JavaScript, no usa IA.
const chatWidget=$("chat-widget");
$("chat-launcher").onclick=()=>chatWidget.classList.toggle("open");
$("close-chat").onclick=()=>chatWidget.classList.remove("open");
function lunaReply(message){
  const m=message.toLowerCase();
  if(/hola|buenas|hey/.test(m))return"¡Holaaa! 💗 Soy Luna. ¿Qué accesorio estás buscando hoy?";
  if(/producto|catálogo|catalogo|tienen|venden/.test(m))return"Tenemos aretes, collares, pulseras, anillos y sets. Puedes verlos en la sección «La colección» y filtrar por categoría.";
  if(/precio|cuesta|costos|cuánto|cuanto/.test(m))return"Los precios de nuestro catálogo de muestra van desde $119 hasta $399 MXN. Cada producto muestra su precio debajo de su nombre.";
  if(/envío|envio|entrega/.test(m))return"En este prototipo el envío de muestra cuesta $59 MXN. ¡Es gratis en compras de $699 MXN o más!";
  if(/comprar|compra|pedido|bolsa|carrito/.test(m))return"Para comprar, presiona «Agregar a mi bolsa» en los productos. Después abre tu bolsa, revisa cantidades y total y selecciona «Continuar compra». La confirmación es simulada.";
  if(/pago|tarjeta|transferencia/.test(m))return"Esta versión es una demostración académica: no recibe pagos ni datos bancarios. La compra solo genera un número de pedido de prueba.";
  if(/favorito|corazón|corazon/.test(m))return"Presiona el corazón que aparece en cada producto para guardarlo. Puedes verlos en la sección «Tus favoritos».";
  if(/gracias/.test(m))return"¡A ti! Gracias por visitar Alma de Luna. Que tengas un día precioso. 🌙";
  if(/ayuda|contacto/.test(m))return"¡Claro! Puedo orientarte sobre productos, precios, envíos, favoritos y cómo realizar una compra de prueba.";
  return"¡Gracias por escribirme! 🌷 Puedo responder preguntas sobre catálogo, precios, envíos, favoritos y proceso de compra.";
}
function sendChat(text){
  const clean=text.trim();if(!clean)return;
  const user=document.createElement("p");user.className="user-message";user.textContent=clean;$("chat-messages").appendChild(user);
  const answer=document.createElement("p");answer.className="bot-message";answer.textContent=lunaReply(clean);$("chat-messages").appendChild(answer);
  $("chat-messages").scrollTop=$("chat-messages").scrollHeight;
}
$("chat-form").addEventListener("submit",e=>{e.preventDefault();sendChat($("chat-input").value);$("chat-input").value="";});
document.querySelectorAll("[data-message]").forEach(b=>b.addEventListener("click",()=>sendChat(b.dataset.message)));
