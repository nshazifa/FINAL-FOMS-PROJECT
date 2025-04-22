import { db, auth } from "./firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const menuContainer = document.getElementById("menu");

// FETCH MENU DATA FROM FIRESTORE
async function fetchProducts() {
    if (!menuContainer) return;

    menuContainer.innerHTML = "";

    const menuDocRef = doc(db, "Menu", "menuItems");
    const subcollections = ["burger-items", "pizza-items", "momos-items", "desert-items", "drinks-items"];

    for (const subcollection of subcollections) {
        const querySnapshot = await getDocs(collection(menuDocRef, subcollection));

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            addProductToPage(item, docSnap.id);
        });
    }

    // Ensure cart status is checked after products are loaded
    setTimeout(checkCartStatus, 1000);
}

// DISPLAY PRODUCT ON PAGE
function addProductToPage(item, productId) {
    const productCard = document.createElement("div");
    productCard.classList.add("menu-item");

    productCard.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-img">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button class="add-to-cart-btn" data-id="${productId}">Add to Cart</button>
    `;

    const addToCartButton = productCard.querySelector(".add-to-cart-btn");
    addToCartButton.addEventListener("click", () => addToCart(addToCartButton, item, productId));

    menuContainer.appendChild(productCard);
}

// CHECK IF ITEM IS IN CART
async function checkCartStatus() {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = collection(db, `Users/${user.uid}/Cart`);
    const cartSnapshot = await getDocs(cartRef);

    const cartItems = cartSnapshot.docs.map(doc => doc.id);

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        const productId = button.getAttribute("data-id");
        if (cartItems.includes(productId)) {
            button.classList.add("added");
            button.innerText = "Added";
            button.disabled = true;
        }
    });
}

// ADD TO CART FUNCTION
async function addToCart(button, product, productId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to add items to the cart!");
            return;
        }

        const cartItemRef = doc(db, `Users/${user.uid}/Cart/${productId}`);
        

        await setDoc(cartItemRef, {
            name: product.name,
            price: product.price || 0,
            quantity: 1,
            image: product.image
        }, { merge: true });

        button.classList.add("added");
        button.innerText = "Added";
        button.disabled = true;
    } catch (error) {
        console.error("Error adding item to cart:", error);
    }
}

// LISTEN FOR AUTH CHANGES
document.addEventListener("DOMContentLoaded", () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            fetchProducts();
        } else {
            menuContainer.innerHTML = "<p>Please log in to view the menu.</p>";
        }
    });
});
