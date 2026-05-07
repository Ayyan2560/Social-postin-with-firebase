  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
        import { app } from "./firebase.mjs";
        
        const auth = getAuth(app);
        onAuthStateChanged(auth, (user) => {
            setTimeout(() => {
                if (user) {
                    window.location.href = "./posts/index.html";
                } else {
                    window.location.href = "./login/index.html";
                }
            }, 1000);
        });