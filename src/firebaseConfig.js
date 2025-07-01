import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, serverTimestamp, get} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyARsMEJn26cCEH3aVrkcVxvt9azZaEaegs",
    authDomain: "charitree-fed4b.firebaseapp.com",
    databaseURL: "https://charitree-fed4b-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "charitree-fed4b",
    storageBucket: "charitree-fed4b.firebasestorage.app",
    messagingSenderId: "770475286583",
    appId: "1:770475286583:web:e7b104ea036482e89fdfb2",
    measurementId: "G-KHX4WZEWKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Make Firebase functions available globally
window.db = db;
window.ref = ref;
window.set = set;
window.get = get;
window.serverTimestamp = serverTimestamp;

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const storedUser = localStorage.getItem("currentUser");
    const storedAdmin = localStorage.getItem("isAdmin");
    const monetaryForm = document.getElementById("monetary-form");
    const itemForm = document.getElementById("item-form");
    const charityForm = document.getElementById("charity-registration-form");
    const treeForm = document.getElementById("plant-tree-form");

    if (storedUser) {
        window.currentUser = JSON.parse(storedUser);
        window.isAdmin = storedAdmin === "true";
        updateUIAfterLogin();
    }

    //register logic
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("register-username").value;
        const fullname = document.getElementById("register-fullname").value;
        const email = document.getElementById("register-email").value;
        const contactNumber = document.getElementById("register-contact").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm").value;
        
        // Simple validation
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        // Check if username already exists
        const userRef = ref(db, "users/" + username);
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    alert("Username already exists! Please choose a different username.");
                    return;
                }

                // Set user data in Firebase
                set(ref(db, "users/" + username), {
                    name: fullname,
                    email: email,
                    contactNumber: contactNumber,
                    password: password, // Note: In production, never store plain text passwords
                    avatar: "", // Empty string for new users - no default image
                    joinDate: serverTimestamp(),
                    totalXp: 0,
                    isAdmin: false
                })
                .then(() => {
                    alert("User registered successfully! Please login with your new account.");
                    // Switch to login form
                    document.getElementById('register-form').style.display = 'none';
                    document.getElementById('login-form').style.display = 'flex';
                    document.querySelectorAll('.auth-tab').forEach(tab => {
                        if (tab.dataset.tab === 'login') {
                            tab.classList.add('active');
                        } else {
                            tab.classList.remove('active');
                        }
                    });
                    // Clear the register form
                    registerForm.reset();
                })
                .catch((error) => {
                    console.error("Error writing to Firebase: ", error);
                    alert("Registration failed: " + error.message);
                });
            })
            .catch((error) => {
                console.error("Error checking username: ", error);
                alert("Registration failed: " + error.message);
            });
        });
    }

    // Login logic
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const username = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            const userRef = ref(db, "users/" + username);

            get(userRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        if (userData.password === password) {
                            window.currentUser = {
                                username: username,
                                fullName: userData.name,
                                email: userData.email,
                                contactNumber: userData.contactNumber,
                                xp: userData.totalXp || 0,
                                avatar: userData.avatar || ""
                            };

                            // ✅ get admin flag from DB
                            window.isAdmin = userData.isAdmin === true;

                            // Optional: save to localStorage
                            localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
                            localStorage.setItem("isAdmin", window.isAdmin);

                            alert("Login successful!");
                            updateUIAfterLogin();
                            document.getElementById('auth-modal').style.display = 'none';
                        } else {
                            alert("Incorrect password.");
                        }
                    } else {
                        alert("User not found.");
                    }
                })
                .catch((error) => {
                    console.error("Login error: ", error);
                    alert("Login failed: " + error.message);
                });
        });
    }   


    // Logout Logic
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logoutUser();
        }); 
    }
    
    if (monetaryForm) {
        monetaryForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const currentUserId = window.currentUser?.username || "anonymous"; // <== moved here
        const donationId = generateDonationKey(currentUserId);
        const donationDate = new Date().toISOString();
        const charityId = document.getElementById("charity").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const paymentMethod = document.getElementById("payment-method").value;
        const message = document.getElementById("message").value.trim();

        const data = {
            userId: currentUserId,
            charityId: charityId,
            type: "monetary",
            message: message || null,
            xpEarned: Math.floor(amount / 10), // Example: 1 XP per ₱10
            donationDate: donationDate,
            status: "pending",
            details: {
            amount: amount,
            paymentMethod: paymentMethod
            }
        };

        set(ref(db, `donations/${donationId}`), data)
            .then(() => {
            alert("Thank you for your monetary donation!");
            monetaryForm.reset();
            })
            .catch((err) => {
            console.error("Error submitting monetary donation:", err);
            alert("Something went wrong. Please try again.");
            });
        });
    }

    if (itemForm) {
        itemForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const currentUserId = window.currentUser?.username || "anonymous"; // <== moved here
        const donationId = generateDonationKey(currentUserId);
        const donationDate = new Date().toISOString();
        const charityId = document.getElementById("item-charity").value; //implement charity name = charityid matching
        const itemType = document.querySelector('input[name="donation-type"]:checked').value;
        const weight = parseFloat(document.getElementById("item-weight").value);
        const deliveryMethod = document.getElementById("delivery-method").value;
        const message = document.getElementById("item-message").value.trim();

        const data = {
            userId: currentUserId,
            charityId: charityId,
            type: "item",
            message: message || null,
            xpEarned: Math.floor(weight * 5), // Example: 5 XP per kg
            donationDate: donationDate,
            status: "pending",
            details: {
            itemType: itemType,
            weight: weight,
            deliveryMethod: deliveryMethod
            }
        };

        set(ref(db, `donations/${donationId}`), data)
            .then(() => {
            alert("Thank you for your item donation!");
            itemForm.reset();
            })
            .catch((err) => {
            console.error("Error submitting item donation:", err);
            alert("Something went wrong. Please try again.");
            });
        });
    }

    if (charityForm) {
        charityForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const charityName = document.getElementById("charity-name").value; // <== moved here
            const charityAddress = document.getElementById("charity-location").value;
            const charityEmail = document.getElementById("charity-email").value;
            const charityPhone = document.getElementById("charity-phone").value;
            const charityDescription = document.getElementById("charity-description").value;
            const charityLogo = document.getElementById("charity-image").value;

            if (!charityName || !charityAddress || !charityEmail || !charityPhone || !charityDescription) {
                alert("Please fill in all required fields.");
                return;
            }

            const charityId = charityName.toLowerCase().replace(/\s+/g, '_');
            const charityRef = ref(db, `charities/${charityId}`);
            const snapshot = await get(charityRef);

            if (snapshot.exists()) {
                alert("Charity name already exists. Please choose a different one.");
                return;
            }


            const data = {
                name: charityName,
                address: charityAddress,
                email: charityEmail,
                phone: charityPhone,
                description: charityDescription,
                logo: charityLogo,
                registeredAt: serverTimestamp(),
                verified: false
            };

            set(ref(db, `charities/${charityId}`), data)
                .then(() => {
                    alert("Charity registered successfully and pending verification.");
                    charityForm.reset();
                })
            .catch((err) => {
                console.error("Error registering charity:", err);
                alert("Failed to register charity. Please try again.");
            });
        });
    }

    document.querySelectorAll('.tree-option').forEach(option => {
        option.addEventListener('click', () => {
        document.querySelectorAll('.tree-option').forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');
        });
    });

    if (treeForm) {
    treeForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        if (!window.currentUser) {
        alert("Please login to plant a tree.");
        return;
        }

        try {
        const currentUserId = window.currentUser.username;
        const userRef = ref(db, `users/${currentUserId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val();
        if (!userData) throw new Error("User not found");

        const currentXp = userData.totalXp || 0;

        // Get selected tree type and XP cost
        const selectedOption = document.querySelector(".tree-option.selected");
        if (!selectedOption) throw new Error("No tree type selected");

        const treeType = selectedOption.dataset.treeType || "Unknown";
        const xpCost = parseInt(
            selectedOption.querySelector(".xp-cost").textContent.replace(/\D/g, "")
        );
        if (currentXp < xpCost)
            throw new Error(`Not enough XP. You need ${xpCost}, but only have ${currentXp}.`);

        const treeLocation = document.getElementById("tree-location").value;
        if (!treeLocation) throw new Error("Please select a location.");

        // Create tree ID and data
        const timestamp = Date.now();
        const treeId = `${currentUserId}_${timestamp}`;

        const dedicationMessage = document.getElementById("tree-message").value.trim();

        const treeData = {
            userId: currentUserId,
            type: treeType,
            location: treeLocation,
            xpCost: xpCost,
            plantedAt: new Date(timestamp).toISOString(),
            message: dedicationMessage || null // Optional
        };

        // Save to Firebase
        await set(ref(db, `trees/${treeId}`), treeData);

        // Deduct XP and update Firebase
        const newXp = currentXp - xpCost;
        await set(ref(db, `users/${currentUserId}/totalXp`), newXp);

        // Update UI
        window.currentUser.xp = newXp;
        localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
        updateUIAfterLogin();

        // Clear form and hide modal
        treeForm.reset();
        alert(`🌱 ${treeType} planted! You used ${xpCost} XP. Remaining XP: ${newXp}`);
        document.getElementById("plant-tree-modal").style.display = "none";
        } catch (error) {
        console.error("Tree planting error:", error);
        alert(error.message);
        }
    });
    }



    function generateDonationKey(username) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `${username}_${timestamp}_${random}`;
    }

    async function updateUIAfterLogin() {
        if (window.currentUser) {
            try {
                const userRef = ref(db, "users/" + window.currentUser.username);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const updatedUser = snapshot.val();
                    window.currentUser.xp = updatedUser.totalXp || 0;
                    window.currentUser.avatar = updatedUser.avatar || "";
                    localStorage.setItem("currentUser", JSON.stringify(window.currentUser));
                }
            } catch (error) {
                console.error("Failed to fetch latest user data:", error);
            }

            // Hide login/register buttons
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const userAvatar = document.getElementById('user-avatar');
            const logoutBtn = document.getElementById('logout-btn');
            const appSidebar = document.getElementById('app-sidebar');
            const usernameDisplay = document.getElementById('username-display');
            const totalXp = document.getElementById('total-xp');
            const adminNavItem = document.getElementById('admin-nav-item');

            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (userAvatar) userAvatar.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'block';
            if (appSidebar) appSidebar.style.display = 'block';
            if (usernameDisplay) {
                usernameDisplay.textContent = window.currentUser.fullName || window.currentUser.username;
            }
            if (totalXp) {
                totalXp.textContent = window.currentUser.xp.toLocaleString();
            }
            if (adminNavItem && window.isAdmin) adminNavItem.style.display = 'block';

            // Update profile avatar - use default user image if no avatar is set
            const profileAvatar = document.getElementById('profile-avatar');
            if (profileAvatar) {
                if (window.currentUser.avatar && window.currentUser.avatar.trim() !== "") {
                    profileAvatar.src = window.currentUser.avatar;
                } else {
                    profileAvatar.src = 'src/image/user.png'; // Default user image for new accounts
                }
            }

            // Update user avatar in header
            const headerUserAvatar = document.querySelector('#user-avatar img');
            if (headerUserAvatar) {
                if (window.currentUser.avatar && window.currentUser.avatar.trim() !== "") {
                    headerUserAvatar.src = window.currentUser.avatar;
                } else {
                    headerUserAvatar.src = 'src/image/user.png'; // Default user image for new accounts
                }
            }
        }
    }


    function updateUIAfterLogout() {
        // Show login/register buttons
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userAvatar = document.getElementById('user-avatar');
        const logoutBtn = document.getElementById('logout-btn');
        const appSidebar = document.getElementById('app-sidebar');
        const adminNavItem = document.getElementById('admin-nav-item');

        const totalXp = document.getElementById('total-xp');
        if (totalXp && window.currentUser) {
            totalXp.textContent = window.currentUser.xp.toLocaleString();
        }

        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (userAvatar) userAvatar.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (appSidebar) appSidebar.style.display = 'none';
        if (adminNavItem) adminNavItem.style.display = 'none';

        // Reset current section to home
        window.location.hash = 'home';
    }

    function logoutUser() {
        window.currentUser = null;
        window.isAdmin = false;
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        
        updateUIAfterLogout();
        alert('Logged out successfully!');
    }
});
