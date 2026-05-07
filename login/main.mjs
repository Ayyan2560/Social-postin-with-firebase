import { 
    getAuth, 
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
    import { app } from "../firebase.mjs";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "../posts/index.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    Swal.fire({
                        icon: "success",
                        title: "Login Successful",
                        text: "Welcome Back!",
                        background: "#1e293b",
                        color: "#f8fafc",
                        confirmButtonColor: "#6366f1",
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "../posts/index.html";
                    });
                })
                .catch((error) => {
                    console.error("Error signing in:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: "Invalid email or password. Please try again.",
                        background: "#1e293b",
                        color: "#f8fafc",
                        confirmButtonColor: "#6366f1"
                    });
                });
        });
    }
});

document.querySelector(".google-btn").addEventListener('click', () => {
    const provider = new GoogleAuthProvider();

    const auth = getAuth();
signInWithPopup(auth, provider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  });
