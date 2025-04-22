import { auth, db } from "./firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadOrderSummary(user.uid);
      document.querySelector("input[name='email']").value = user.email;
    }
  });
});

// Function to fetch and display order summary
async function loadOrderSummary(userId) {
  if (!userId) {
    document.getElementById("orderSummary").innerHTML = "<p>Please log in to view your orders.</p>";
    return;
  }

  const orderSummaryContainer = document.getElementById("orderSummary");
  orderSummaryContainer.innerHTML = "";

  try {
    const ordersRef = collection(db, `Users/${userId}/Orders`);
    const querySnapshot = await getDocs(ordersRef);

    if (querySnapshot.empty) {
      orderSummaryContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    for (const orderDoc of querySnapshot.docs) {
      const orderData = orderDoc.data();
      const orderElement = document.createElement("div");
      orderElement.classList.add("order-item");
      orderElement.innerHTML = `
        <h4>Order ID: ${orderDoc.id}</h4>
        <p>Status: ${orderData.status || "Unknown"}</p>
        <p>Total Amount: ₹${(orderData.total || 0).toFixed(2)}</p>
        <p>Payment Method: ${orderData.paymentMethod || "N/A"}</p>
        <ul id="order-items-${orderDoc.id}">Loading items...</ul>
      `;
      orderSummaryContainer.appendChild(orderElement);

      // Fetch order items separately
      const orderItemsRef = collection(db, `Users/${userId}/Orders/${orderDoc.id}/OrderItems`);
      const orderItemsSnapshot = await getDocs(orderItemsRef);
      const orderItemsList = document.getElementById(`order-items-${orderDoc.id}`);
      orderItemsList.innerHTML = "";

      if (orderItemsSnapshot.empty) {
        orderItemsList.innerHTML = "<li>No items found.</li>";
      } else {
        orderItemsSnapshot.forEach((itemDoc) => {
          const item = itemDoc.data();
          orderItemsList.innerHTML += `<li>${item.name} x${item.quantity} - ₹${(item.rowTotal || 0).toFixed(2)}</li>`;
        });
      }
    }
  } catch (error) {
    console.error("Error loading orders:", error);
    orderSummaryContainer.innerHTML = "<p>Failed to load orders.</p>";
  }
}


const checkoutForm = document.getElementById("checkout-form");
checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("User not authenticated!");
    return;
  }

  if (!window.currentCart || window.currentCart.length === 0) {
    alert("Your cart is empty. Add items before proceeding to checkout.");
    return;
  }

  try {
    const totalElement = document.getElementById("totalPrice");
    if (!totalElement) {
      alert("Total price element not found!");
      return;
    }

    const total = parseFloat(totalElement.textContent.replace("Total: ₹", "")) || 0;

    // Fetch existing orders to determine the next order ID
    const ordersCollection = collection(db, `Users/${user.uid}/Orders`);
    const orderSnapshots = await getDocs(ordersCollection);
    const nextOrderId = `order_${orderSnapshots.size + 1}`;

    // Create order document
    const orderRef = doc(db, `Users/${user.uid}/Orders/${nextOrderId}`);
    await setDoc(orderRef, {
      email: user.email,
      total: total,
      timestamp: new Date(),
      status: "Pending",
    });

    // Store Delivery Information
    const deliveryRef = doc(db, `Users/${user.uid}/Orders/${nextOrderId}/DeliveryInfo/Details`);
    await setDoc(deliveryRef, {
      firstName: checkoutForm["first-name"].value,
      lastName: checkoutForm["last-name"].value,
      phone: checkoutForm["phone"].value,
      address: checkoutForm["address"].value,
      paymentMethod: checkoutForm["payment-method"].value,
      email: user.email,
    });

    // Store Order Items
    for (const item of window.currentCart) {
      await setDoc(doc(db, `Users/${user.uid}/Orders/${nextOrderId}/OrderItems/${item.id}`), item);
    }

    alert("Order placed successfully!");
    window.location.href = "confirmation.html";
  } catch (error) {
    console.error("Error saving order: ", error);
    alert("Failed to place order. Please try again.");
  }
});
