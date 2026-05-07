import { getAuth, createUserWithEmailAndPassword, } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import "../firebase.mjs";

const auth = getAuth()

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.querySelector("#signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.querySelector("#email").value;
            const password = document.querySelector("#password").value;
            const cnfrm_password = document.querySelector("#cnfrm_password").value;

            if (password !== cnfrm_password) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Passwords do not match!",
                    background: "#1e293b",
                    color: "#f8fafc",
                    confirmButtonColor: "#6366f1"
                });
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    Swal.fire({
                        icon: "success",
                        title: "Welcome!",
                        text: "Your account has been created successfully.",
                        background: "#1e293b",
                        color: "#f8fafc",
                        confirmButtonColor: "#6366f1"
                    }).then(() => {
                        window.location.href = "../login/index.html";
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Signup Failed",
                        text: error.message,
                        background: "#1e293b",
                        color: "#f8fafc",
                        confirmButtonColor: "#6366f1"
                    });
                });
        });
    }
});