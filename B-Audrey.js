import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const form = document.getElementById('upload-form');
const fileInput = document.getElementById('file');
const categoryInput = document.getElementById('category');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const submitBtn = document.getElementById('submit-btn');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const grid = document.getElementById('portfolio-grid');

// Login variables
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginError = document.getElementById('login-error');

// UPLOAD FUNCTION
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return;

  submitBtn.disabled = true;
  progressContainer.style.display = 'block';

  // Determine type (image or video)
  const isVideo = file.type.startsWith('video/');
  const type = isVideo ? 'video' : 'image';

  // Generate unique filename
  const filename = Date.now() + '_' + file.name;
  const storageRef = ref(storage, 'portfolio/' + filename);

  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressFill.style.width = progress + '%';
      progressText.textContent = Math.round(progress) + '%';
    }, 
    (error) => {
      console.error(error);
      alert("Erreur lors de l'upload: " + error.message);
      submitBtn.disabled = false;
      progressContainer.style.display = 'none';
    }, 
    async () => {
      // Upload completed successfully
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      
      try {
        // Save to Firestore
        await addDoc(collection(db, "portfolio"), {
          type: type,
          src: downloadURL,
          storagePath: 'portfolio/' + filename, // save path to allow deletion later
          category: categoryInput.value,
          title: titleInput.value,
          desc: descInput.value,
          createdAt: serverTimestamp()
        });

        alert("Élément ajouté au portfolio avec succès !");
        form.reset();
        progressContainer.style.display = 'none';
        submitBtn.disabled = false;
        progressFill.style.width = '0%';
        
        loadPortfolio(); // refresh grid
      } catch (e) {
        console.error("Erreur lors de l'ajout dans la base:", e);
        alert("Erreur lors de l'ajout dans la base de données.");
        submitBtn.disabled = false;
      }
    }
  );
});

// READ FUNCTION
async function loadPortfolio() {
  grid.innerHTML = '<p>Chargement...</p>';
  try {
    const q = query(collection(db, "portfolio"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    grid.innerHTML = '';
    
    if (querySnapshot.empty) {
      grid.innerHTML = '<p>Le portfolio est vide.</p>';
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      const card = document.createElement('div');
      card.className = 'card';
      
      const mediaHtml = data.type === 'video' 
        ? `<video src="${data.src}" muted></video>` 
        : `<img src="${data.src}" alt="${data.title}">`;

      card.innerHTML = `
        <div class="card-media">
          ${mediaHtml}
          <div class="card-category">${data.category}</div>
        </div>
        <div class="card-content">
          <h3>${data.title}</h3>
          <p>${data.desc}</p>
          <div class="card-actions">
            <button class="btn danger" data-id="${id}" data-path="${data.storagePath || ''}">Supprimer</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    // Add delete listeners
    document.querySelectorAll('.btn.danger').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
        
        const id = e.target.getAttribute('data-id');
        const path = e.target.getAttribute('data-path');
        
        btn.disabled = true;
        btn.textContent = "Suppression...";

        try {
          // Delete from Firestore
          await deleteDoc(doc(db, "portfolio", id));
          // Delete from Storage if path exists
          if (path && path !== 'undefined') {
            const fileRef = ref(storage, path);
            await deleteObject(fileRef).catch(err => console.log("Storage file not found, continuing...", err));
          }
          
          loadPortfolio(); // refresh
        } catch (error) {
          console.error("Erreur lors de la suppression:", error);
          alert("Erreur lors de la suppression.");
          btn.disabled = false;
          btn.textContent = "Supprimer";
        }
      });
    });

  } catch (error) {
    console.error("Erreur lecture:", error);
    grid.innerHTML = '<p>Erreur de connexion à la base de données. Assurez-vous d\'avoir configuré Firestore.</p>';
  }
}

// LOGIN LOGIC
const CREDENTIALS = {
  email: 'audpbakyono@gmail.com',
  password: '$1704@'
};

if (sessionStorage.getItem('dashboard_auth') === 'true') {
  loginOverlay.classList.add('hidden');
  loadPortfolio();
}

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (loginEmail.value === CREDENTIALS.email && loginPassword.value === CREDENTIALS.password) {
    sessionStorage.setItem('dashboard_auth', 'true');
    loginOverlay.classList.add('hidden');
    loadPortfolio();
  } else {
    loginError.textContent = "Identifiants incorrects.";
  }
});
