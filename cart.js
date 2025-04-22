// Firebase imports
import { db, auth } from "./firebase-config.js";
import {
    collection, getDocs, updateDoc, doc, deleteDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/**
 * Fetches and displays the user's cart items.
 */
async function loadCart() {
    const user = auth.currentUser;
    if (!user) return showEmptyCart("Please log in to view your cart.");

    const userId = user.uid;
    const cartContainer = document.getElementById("cartItems");
    const totalPriceElement = document.getElementById("totalPrice");
    const checkoutButton = document.getElementById("placeOrderButton");
    cartContainer.innerHTML = "";

    try {
        const cartRef = collection(db, `Users/${userId}/Cart`);
        const querySnapshot = await getDocs(cartRef);
        let grandTotal = 0;
        
        if (querySnapshot.empty) return showEmptyCart("Your cart is empty.");
        
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const itemId = docSnap.id;
            const quantity = item.quantity || 1;
            const rowTotal = (item.price || 0) * quantity;
            grandTotal += rowTotal;

            const listItem = document.createElement("li");
            listItem.classList.add("cart-item-container");
            listItem.innerHTML = `
                <span>•</span>
                <img src="${item.image}" style="width: 45px; height: 50px;">
                <span class="product-name">${item.name}</span>
                <span class="quantity-display">x${quantity}</span>
                <div class="quantity-controls">
                    <button class="decrease" data-id="${itemId}" data-quantity="${quantity}">-</button>
                    <button class="increase" data-id="${itemId}" data-quantity="${quantity}">+</button>
                </div>
                <span class="row-total">₹${rowTotal.toFixed(2)}</span>
            `;
            cartContainer.appendChild(listItem);
        });

        totalPriceElement.textContent = `Total: ₹${grandTotal.toFixed(2)}`;
        checkoutButton.disabled = false;

        attachQuantityHandlers(userId);
    } catch (error) {
        console.error("Error loading cart:", error);
    }
}

/**
 * Displays an empty cart message.
 */
function showEmptyCart(message) {
    document.getElementById("cartItems").innerHTML = `<li>${message}</li>`;
    document.getElementById("totalPrice").textContent = "Total: ₹0";
    document.getElementById("placeOrderButton").disabled = true;
}

/**
 * Attaches event listeners for increasing and decreasing quantity.
 */
function attachQuantityHandlers(userId) {
    document.querySelectorAll(".decrease").forEach(button => {
        button.addEventListener("click", () => {
            const itemId = button.dataset.id;
            let quantity = parseInt(button.dataset.quantity);
            if (quantity > 1) {
                updateQuantity(userId, itemId, quantity - 1);
            } else if (confirm("Remove item from cart?")) {
                updateQuantity(userId, itemId, 0);
            }
        });
    });

    document.querySelectorAll(".increase").forEach(button => {
        button.addEventListener("click", () => {
            const itemId = button.dataset.id;
            let quantity = parseInt(button.dataset.quantity);
            updateQuantity(userId, itemId, quantity + 1);
        });
    });
}

/**
 * Updates the quantity of an item in Firestore.
 */
async function updateQuantity(userId, itemId, newQuantity) {
    const itemRef = doc(db, `Users/${userId}/Cart`, itemId);
    try {
        newQuantity > 0 ? await updateDoc(itemRef, { quantity: newQuantity }) : await deleteDoc(itemRef);
        loadCart();
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

/**
 * Clears all items from the cart.
 */
async function clearCart() {
    const user = auth.currentUser;
    if (!user) return alert("Please log in to clear your cart.");

    const userId = user.uid;
    const cartRef = collection(db, `Users/${userId}/Cart`);

    try {
        const querySnapshot = await getDocs(cartRef);
        const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));

        await Promise.all(deletePromises);
        showEmptyCart("Your cart is empty.");
        alert("Cart cleared successfully!");
    } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Failed to clear cart.");
    }
}

// Attach event listener to the clear button
document.getElementById("clearCartButton").addEventListener("click", clearCart);


/**
 * Handles the checkout process.
 */


async function proceedToCheckout() {
    const user = auth.currentUser;
    if (!user) return alert("Please log in to proceed.");

    const userId = user.uid;
    try {
        const cartRef = collection(db, `Users/${userId}/Cart`);
        const querySnapshot = await getDocs(cartRef);
        if (querySnapshot.empty) return alert("Your cart is empty.");

        // Redirect to checkout page without clearing cart
        window.location.href = "checkout.html";
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("Failed to process checkout.");
    }
}

// Initialize event listeners
onAuthStateChanged(auth, (user) => user && loadCart());
document.getElementById("placeOrderButton").addEventListener("click", proceedToCheckout);