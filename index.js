// import { auth, db } from "./firebase-config.js"; 
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   onAuthStateChanged,
//   signOut
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// document.addEventListener("DOMContentLoaded", () => {
//   const loginForm = document.getElementById("login-section");
//   const signupSection = document.getElementById("signup-section");
//   const signupBtn = document.getElementById("signup-btn");
//   const loginBtn = document.getElementById("toggle-login");
//   const adminLink = document.getElementById("admin-link");

//   document.getElementById("show-signup").addEventListener("click", () => {
//     loginForm.style.display = "none";
//     signupSection.style.display = "block";
//   });

//   document.getElementById("show-login").addEventListener("click", () => {
//     signupSection.style.display = "none";
//     loginForm.style.display = "block";
//   });

//   signupBtn.addEventListener("click", async (event) => {
//     event.preventDefault();
  
//     const username = document.getElementById("signup-username").value.trim();
//     const email = document.getElementById("signup-email").value.trim();
//     const password = document.getElementById("signup-password").value;
  
//     if (!username || !email || !password) {
//       alert("Please fill all fields.");
//       return;
//     }
  
//     try {
//       // Create user in Firebase Authentication
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
  
//       // ✅ Generate a custom UID
//       const customUID = username.toLowerCase() + "_user" + crypto.randomUUID().substring(0, 5);
  
//       // ✅ Store user details in Firestore with custom UID as the document ID
//       await setDoc(doc(db, "Users", customUID), { 
//         username, 
//         email, 
//         firebaseUID: user.uid,  // Storing Firebase UID in Firestore as well
//         role: "user" 
//       });
  
//       alert("Account Created Successfully! Please log in.");
//       signupSection.style.display = "none"; 
//       loginForm.style.display = "block"; 
  
//     } 
  
//   catch (error) {
//         console.error("Signup Error: ", error); // Log the error to the console
        
//     }
// });

//   loginForm.addEventListener("submit", async (event) => {
//     event.preventDefault();
//     const email = document.getElementById("login-email").value.trim();
//     const password = document.getElementById("login-password").value;

//     if (!email || !password) {
//       alert("Please enter both email and password.");
//       return;
//     }

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       alert("Login Successful!");
//       window.location.href = "product.html";
//     } catch (error) {
//       alert("Login Error: " + error.message);
//     }
//   });

//   onAuthStateChanged(auth, async (user) => {
//     if (user) {
//       // Do not change login button to logout
//       const userDoc = await getDoc(doc(db, "Users", user.uid));
//       if (userDoc.exists() && userDoc.data().role === "admin") {
//         adminLink.style.display = "block";
//       }
//     } else {
//       if (loginBtn) {
//         loginBtn.textContent = "Login";
//         loginBtn.onclick = () => {
//           document.getElementById("login-form").style.display = "block";
//         };
//       }
//     }
//   });
  
//   // onAuthStateChanged(auth, async (user) => {
//   //   if (user) {
//   //     if (loginBtn) {
//   //       loginBtn.textContent = "Logout";
//   //       loginBtn.onclick = async () => {
//   //         await signOut(auth);
//   //         alert("Logged Out Successfully");
//   //         setTimeout(() => {
//   //           window.location.href = "index.html";
//   //         }, 500); // Smooth redirection
//   //       };
//   //     }

//   //     const userDoc = await getDoc(doc(db, "Users", user.uid));
//   //     if (userDoc.exists() && userDoc.data().role === "admin") {
//   //       adminLink.style.display = "block";
//   //     }
//   //   } else {
//   //     if (loginBtn) {
//   //       loginBtn.textContent = "Login";
//   //       loginBtn.onclick = () => {
//   //         document.getElementById("login-form").style.display = "block";
//   //       };
//   //     }
//   //   }
//   // });
// });

import { auth, db } from "./firebase-config.js"; 
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-section");
  const signupSection = document.getElementById("signup-section");
  const signupBtn = document.getElementById("signup-btn");
  const loginBtn = document.getElementById("toggle-login");
  const adminLink = document.getElementById("admin-link");

  document.getElementById("show-signup").addEventListener("click", () => {
    loginForm.style.display = "none";
    signupSection.style.display = "block";
  });

  document.getElementById("show-login").addEventListener("click", () => {
    signupSection.style.display = "none";
    loginForm.style.display = "block";
  });

  signupBtn.addEventListener("click", async (event) => {
    event.preventDefault();
  
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
  
    if (!username || !email || !password) {
      alert("Please fill all fields.");
      return;
    }
  
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Store user details in Firestore using Firebase UID as the document ID
      await setDoc(doc(db, "Users", user.uid), { 
        username, 
        email, 
        firebaseUID: user.uid,  // Storing Firebase UID in Firestore as well
        role: "user" 
      });
  
      alert("Account Created Successfully! Please log in.");
      signupSection.style.display = "none"; 
      loginForm.style.display = "block"; 
  
    } catch (error) {
        console.error("Signup Error: ", error); // Log the error to the console
    }
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
      window.location.href = "product.html";
    } catch (error) {
      alert("Login Error: " + error.message);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Do not change login button to logout
      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        adminLink.style.display = "block";
      }
    } else {
      if (loginBtn) {
        loginBtn.textContent = "Login";
        loginBtn.onclick = () => {
          document.getElementById("login-form").style.display = "block";
        };
      }
    }
  });
});

