// Fonction pour vérifier l'existance de l'image
function imageExists(imageSrc) {
    return fetch(imageSrc, { method: 'HEAD' })
        .then(response => {
            return response.ok;
        })
        .catch(() => false);
}

async function updateImage(imgElement, folder, images, index) {
    const imageSrc = window.location.origin + '/' + folder + images[index];

    // Vérifie si l'image existe avant de mettre à jour l'élément img
    const exists = await imageExists(imageSrc);

    if (exists) {
        imgElement.src = imageSrc;
    } else {
        console.log('L\'image n\'existe pas :', imageSrc);
        // Vous pouvez choisir de gérer le cas où l'image n'existe pas, par exemple, afficher une image par défaut.
    }
}

// Fonction pour le défilement infini à gauche
async function prevImage(button) {
    const vetement = button.parentElement;
    const folder = vetement.getAttribute('data-folder');
    const images = vetement.getAttribute('data-images').split(',');
    const imgElement = vetement.getElementsByTagName('img')[0];
    let currentIndex = parseInt(vetement.getAttribute('data-current-index')) || 0;

    currentIndex = (currentIndex - 1 + images.length) % images.length;

    // Tant que l'image actuelle n'existe pas, continuez à revenir en arrière
    while (!(await imageExists(window.location.origin + '/' + folder + images[currentIndex]))) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
    }

    updateImage(imgElement, folder, images, currentIndex);

    // Mettez à jour l'attribut data-current-index
    vetement.setAttribute('data-current-index', currentIndex);
}

// Fonction pour le défilement infini à droite
async function nextImage(button) {
    const vetement = button.parentElement;
    const folder = vetement.getAttribute('data-folder');
    const images = vetement.getAttribute('data-images').split(',');
    const imgElement = vetement.getElementsByTagName('img')[0];
    let currentIndex = parseInt(vetement.getAttribute('data-current-index')) || 0;

    currentIndex = (currentIndex + 1) % images.length;

    // Tant que l'image actuelle n'existe pas, continuez à avancer
    while (!(await imageExists(window.location.origin + '/' + folder + images[currentIndex]))) {
        currentIndex = (currentIndex + 1) % images.length;
    }

    updateImage(imgElement, folder, images, currentIndex);

    // Mettez à jour l'attribut data-current-index
    vetement.setAttribute('data-current-index', currentIndex);
}



async function getCategoryNumber(folderPath) {
    const categoryPath = folderPath + 'category.json';

    try {
        const response = await fetch(categoryPath);
        const data = await response.json();

        if (data && data.categoryNumber) {
            return data.categoryNumber;
        } else {
            console.error('Le fichier category.json ne contient pas de numéro de catégorie valide.');
            return null;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du fichier category.json :', error);
        return null;
    }
}


//<---------->
            // Fonction pour récupérer le contenu d'un fichier description.txt
function getDescription(folderPath) {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', folderPath + 'description.txt', false);
                xhr.send();
                return xhr.responseText;
}

async function getCategoryIdInDiv(folderPath, vetementDiv) {
    // Récupérer la catégorie
    const categoryNumber = await getCategoryNumber(folderPath);
    if (categoryNumber !== null) {
        vetementDiv.setAttribute('data-category', categoryNumber);
    } else {
        console.error('La catégorie n\'a pas pu être récupérée pour le dossier :', folderPath);
    }
}
// Fonction pour créer une div pour chaque article
function createVetementDiv(folderPath, imageNames) {
    const vetementDiv = document.createElement('div');
    vetementDiv.classList.add('vetement');
    vetementDiv.setAttribute('data-folder', folderPath);
    vetementDiv.setAttribute('data-images', imageNames.join(','));

      getCategoryIdInDiv(folderPath, vetementDiv);
    
                // Créer l'image principale
                const img = document.createElement('img');
                img.src = folderPath + imageNames[0];
                img.alt = 'Image 1';
                
               const prevBtn = document.createElement('button');
                prevBtn.classList.add('prev-btn');
                prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';

                const nextBtn = document.createElement('button');
                nextBtn.classList.add('next-btn');
                nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                
                // Créer la div overlay
                const overlayDiv = document.createElement('div');
                overlayDiv.classList.add('vetement-overlay');
                
                // Récupérer et afficher les informations de description
                const descriptionText = getDescription(folderPath);
                const vetementInfoDiv = document.createElement('div');
                vetementInfoDiv.classList.add('vetement-info');
                vetementInfoDiv.innerHTML = descriptionText;
                
                // Ajouter les éléments à la div principale
                overlayDiv.appendChild(vetementInfoDiv);
                vetementDiv.appendChild(img);
                vetementDiv.appendChild(prevBtn);
                vetementDiv.appendChild(nextBtn);
                vetementDiv.appendChild(overlayDiv);
                
                return vetementDiv;
}

// Fonction pour créer toutes les divs
function createAllVetementDivs() {
                const container = document.getElementById('containerDivVetements'); // Remplacez 'container' par l'ID de votre conteneur HTML
                const sourceFolder = 'vetements/';
                const numFiles = 31; // Remplacez par le nombre de fichiers "accueilX" que vous avez
      
                for (let i = 1; i <= numFiles; i++) {
                    const folderPath = sourceFolder + 'accueil' + i + '/';
                    const imageNames = ['accueil1.jpg', 'accueil2.jpg', 'accueil3.jpg', 'accueil4.jpg', 'accueil5.jpg', 'accueil6.jpg', 'accueil7.jpg', 'accueil8.jpg']; // Remplacez par les noms de vos images
                    const vetementDiv = createVetementDiv(folderPath, imageNames);
                    container.appendChild(vetementDiv);
                }
                
                // Sélectionnez tous les boutons avec la classe prev-btn
                const prevButtons = document.querySelectorAll('.prev-btn');

                // Ajoutez un gestionnaire d'événements click à chaque bouton prev-btn
                prevButtons.forEach(function(prevButton) {
                    prevButton.addEventListener('click', function() {
                        // Appelez la fonction prevImage en passant le bouton comme argument
                        nextImage(this);
                    });
                });

                // Sélectionnez tous les boutons avec la classe next-btn
                const nextButtons = document.querySelectorAll('.next-btn');
                
                // Ajoutez un gestionnaire d'événements click à chaque bouton next-btn
                nextButtons.forEach(function(nextButton) {
                    nextButton.addEventListener('click', function() {
                        // Appelez la fonction nextImage en passant le bouton comme argument
                        prevImage(this);
                    });
                });
}

// Fonction pour filtrer les div en fonction de la catégorie
function filterDivs(category) {
    const vetementDivs = document.querySelectorAll('.vetement');

    vetementDivs.forEach(vetementDiv => {
        const dataCategory = vetementDiv.getAttribute('data-category');
        if (category === 'all' || dataCategory === category) {
            vetementDiv.style.display = 'block';
        } else {
            vetementDiv.style.display = 'none';
        }
    });
}

// Fonction pour ajouter des gestionnaires d'événements aux boutons de filtre
function setupFilterButtons() {
    const allButton = document.getElementById('allButton');
    allButton.addEventListener('click', function() {
        filterDivs('all');
    });

    const topsButton = document.getElementById('topsButton');
    topsButton.addEventListener('click', function() {
        filterDivs('1');
    });

    const dressButton = document.getElementById('dressButton');
    dressButton.addEventListener('click', function() {
        filterDivs('2');
    });
    
    const coatsButton = document.getElementById('coatsButton');
    coatsButton.addEventListener('click', function() {
        filterDivs('3');
    });

    const pantsButton = document.getElementById('pantsButton');
    pantsButton.addEventListener('click', function() {
        filterDivs('4');
    });
    
    const combiButton = document.getElementById('combiButton');
    combiButton.addEventListener('click', function() {
        filterDivs('5');
    });

    const hatButton = document.getElementById('hatButton');
    hatButton.addEventListener('click', function() {
        filterDivs('6');
    });
    const beltButton = document.getElementById('beltButton');
    beltButton.addEventListener('click', function() {
        filterDivs('7');
    });
    const karmaKiriButton = document.getElementById('karmaKiriButton');
    karmaKiriButton.addEventListener('click', function() {
        filterDivs('8');
    });
}


window.onload = function() {
    setupFilterButtons();
    createAllVetementDivs();
};
