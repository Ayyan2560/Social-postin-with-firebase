import { 
    getFirestore, collection, addDoc, getDocs, orderBy, doc, deleteDoc, setDoc, query, updateDoc, arrayUnion, arrayRemove 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { app } from "../firebase.mjs";

const db = getFirestore(app);
const auth = getAuth();

// Utility for UI Feedback
const showToast = (title, icon = "success") => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: icon,
        title: title,
        background: "#151821",
        color: "#f8fafc",
    });
};

// create
const create_post = async (e) => {
    e.preventDefault();
    const titleInput = document.querySelector("#title");
    const descInput = document.querySelector("#description");
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!title || !description) {
        showToast("Please fill in both title and description", "warning");
        return;
    }

    let userEmail = auth.currentUser ? auth.currentUser.email : "Anonymous";

    try {
        await addDoc(collection(db, "posts"), {
            title: title,
            description: description,
            cretedOn: new Date().getTime(),
            email: userEmail,
            likes: [],
            comments: []
        });
        
        e.target.reset();
        showToast("Your post is live!");
        get_data();

    } catch (error) {
        console.error(error);
        showToast("Could not publish post", "error");
    }
}

// delete
const delete_post = async (id) => {
    const result = await Swal.fire({
        title: "Delete this post?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Yes, delete",
        background: "#151821",
        color: "#f8fafc"
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "posts", id));
            showToast("Post removed");
            get_data();
        } catch (error) {
            console.error(error);
        }
    }
}

// edit
const edit_post = async (id, oldTitle, oldDescription) => {
    const { value: formValues } = await Swal.fire({
        title: "Edit Post",
        background: "#151821",
        color: "#f8fafc",
        html: `
            <div style="text-align: left;">
                <input id="swal-title" class="swal2-input" style="width: 100%; background: #0a0c14; color: white; border: 1px solid rgba(255,255,255,0.1);" value="${oldTitle}">
                <textarea id="swal-description" class="swal2-textarea" style="width: 100%; background: #0a0c14; color: white; border: 1px solid rgba(255,255,255,0.1); height: 100px;">${oldDescription}</textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        confirmButtonColor: "#6366f1",
        preConfirm: () => {
            return {
                title: document.getElementById("swal-title").value,
                description: document.getElementById("swal-description").value
            }
        }
    });

    if (!formValues) return;

    try {
        await updateDoc(doc(db, "posts", id), {
            title: formValues.title,
            description: formValues.description
        });
        showToast("Post updated");
        get_data();
    } catch (error) {
        console.error(error);
    }
}

// Like functionality
const like_post = async (postId, currentLikes) => {
    if (!auth.currentUser) return showToast("Login to like", "warning");

    const userEmail = auth.currentUser.email;
    const postRef = doc(db, "posts", postId);
    const hasLiked = currentLikes && currentLikes.includes(userEmail);

    try {
        await updateDoc(postRef, {
            likes: hasLiked ? arrayRemove(userEmail) : arrayUnion(userEmail)
        });
        get_data();
    } catch (error) {
        console.error(error);
    }
};

// Comment functionality
const add_comment = async (postId) => {
    if (!auth.currentUser) return showToast("Login to comment", "warning");

    const { value: text } = await Swal.fire({
        title: 'Add Comment',
        input: 'text',
        inputPlaceholder: 'Write something...',
        showCancelButton: true,
        background: "#151821",
        color: "#f8fafc",
        confirmButtonColor: "#6366f1",
        inputValidator: (value) => {
            if (!value) return 'You need to write something!'
        }
    });

    if (text) {
        try {
            await updateDoc(doc(db, "posts", postId), {
                comments: arrayUnion({
                    user: auth.currentUser.email,
                    text: text,
                    time: new Date().getTime()
                })
            });
            showToast("Comment added");
            get_data();
        } catch (error) {
            console.error(error);
        }
    }
};

// get
const get_data = async () => {
    const result = document.querySelector("#postsContainer");
    if (!result) return;
    
    try {
        const q = query(collection(db, "posts"), orderBy("cretedOn", "desc"));
        const querySnapshot = await getDocs(q);
        
        result.innerHTML = "";
        const currentUserEmail = auth.currentUser ? auth.currentUser.email : "";

        querySnapshot.forEach((doc) => {
            const post = doc.data();
            const isOwner = currentUserEmail === post.email;
            const likesCount = post.likes ? post.likes.length : 0;
            const hasLiked = post.likes ? post.likes.includes(currentUserEmail) : false;
            const comments = post.comments || [];

            const postCard = document.createElement("div");
            postCard.className = "post-card";

            postCard.innerHTML = `
                <div class="post-header">
                    <div class="avatar">${post.email.charAt(0).toUpperCase()}</div>
                    <div class="post-user-info">
                        <span class="username">${post.email}</span>
                        <span class="time">${moment(post.cretedOn).fromNow()}</span>
                    </div>
                </div>
                <div class="post-content">
                    <h2>${post.title}</h2>
                    <p>${post.description}</p>
                </div>
                <div class="post-footer">
                    <div class="footer-actions">
                        <button class="action-btn like-btn ${hasLiked ? 'active' : ''}" style="${hasLiked ? 'color: #6366f1; border-color: #6366f1; background: rgba(99,102,241,0.1);' : ''}">
                            <i class="${hasLiked ? 'fas' : 'far'} fa-heart"></i> Like <span>${likesCount}</span>
                        </button>
                        <button class="action-btn comment-btn"><i class="far fa-comment"></i> Comment <span>${comments.length}</span></button>
                        <button class="action-btn share-btn"><i class="far fa-share-square"></i> Share</button>
                    </div>
                    ${isOwner ? `
                        <div class="owner-tools">
                            <i class="fas fa-edit edit-btn"></i>
                            <i class="fas fa-trash delete-btn"></i>
                        </div>
                    ` : ''}
                </div>
                <div class="comments-section" style="display: none; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                    ${comments.map(c => `
                        <div style="margin-bottom: 0.8rem; font-size: 0.85rem;">
                            <b style="color: var(--primary);">${c.user.split('@')[0]}:</b> <span>${c.text}</span>
                            <div style="font-size: 0.7rem; color: var(--muted);">${moment(c.time).fromNow()}</div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Listeners
            if (isOwner) {
                postCard.querySelector(".edit-btn").onclick = () => edit_post(doc.id, post.title, post.description);
                postCard.querySelector(".delete-btn").onclick = () => delete_post(doc.id);
            }

            postCard.querySelector(".like-btn").onclick = () => like_post(doc.id, post.likes);
            postCard.querySelector(".comment-btn").onclick = () => {
                const section = postCard.querySelector(".comments-section");
                section.style.display = section.style.display === 'none' ? 'block' : 'none';
                add_comment(doc.id);
            };
            postCard.querySelector(".share-btn").onclick = () => {
                navigator.clipboard.writeText(window.location.href);
                showToast("URL copied!");
            };

            result.appendChild(postCard);
        });

    } catch (error) {
        console.error(error);
    }
}

// Global setup
const setup = () => {
    const postForm = document.querySelector("#postForm");
    if (postForm) postForm.addEventListener('submit', create_post);

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            signOut(auth).then(() => window.location.href = "../login/index.html");
        };
    }

    document.querySelectorAll(".sidebar nav a").forEach(link => {
        link.onclick = () => showToast(link.innerText.trim() + " section soon!", "info");
    });
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userEmail = user.email;
        const userName = userEmail.split('@')[0];
        const userInitial = userEmail.charAt(0).toUpperCase();

        const updateUI = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };

        updateUI("sidebarEmail", userEmail);
        updateUI("sidebarName", userName);
        updateUI("sidebarAvatar", userInitial);
        updateUI("headerEmail", userEmail);
        updateUI("headerName", userName);
        updateUI("headerAvatar", userInitial);
        
        get_data();
    } else {
        const path = window.location.pathname;
        if (!path.includes("login") && !path.includes("signup")) window.location.href = "../login/index.html";
    }
});

// Run
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', setup) : setup();