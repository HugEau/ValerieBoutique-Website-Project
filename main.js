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

async function getPromotion(folderPath) {
    const categoryPath = folderPath + 'category.json';

    try {
        const response = await fetch(categoryPath);
        const data = await response.json();

        if (data && data.promotion) {
            return data.promotion;
        } else {
            return null;
        }
    } catch (error) {
        return null;
    }
}

// Fonction pour créer une div pour chaque article
function createVetementDiv(folderPath, imageNames, i) {
    const vetementDiv = document.createElement('div');
    vetementDiv.classList.add('vetement');
    vetementDiv.setAttribute('data-folder', folderPath);
    vetementDiv.setAttribute('data-images', imageNames.join(','));

      getCategoryIdInDiv(folderPath, vetementDiv);
      
    //à gérer : création de div si promotion HTML, CSS, JS
    getPromotion(folderPath).then(promotion => {
        if (promotion !== null) {
            let originalPrice = null;
            // Vérifier si la div de promotion existe déjà
            let existingPromotionDiv = vetementDiv.querySelector('.vetements__promotion');
    
            if (!existingPromotionDiv) {
                // Si elle n'existe pas, créez-la
                let imgPromotionDiv = document.createElement("div");
                imgPromotionDiv.className = "vetements__promotion";
                
                let imgPromotionText = document.createElement("h4");
                imgPromotionText.innerHTML = "- " + promotion + "%";
                
                imgPromotionDiv.appendChild(imgPromotionText);
                vetementDiv.appendChild(imgPromotionDiv);
            }
            let articlePrice = vetementDiv.querySelector('.prixArticle').innerHTML;
                // Fonction pour extraire un nombre d'une chaîne
                function extractNumber(str) {
                    return Number(str.replace(/[^\d]/g, ''));
                }
                originalPrice = extractNumber(articlePrice);
                console.log(originalPrice)
                updatePriceInImgShower(vetementDiv, promotion, originalPrice)
        } else {
            let existingPromotionDiv = vetementDiv.querySelector('.imgShower__promotion');
            if (existingPromotionDiv) {
                existingPromotionDiv.remove()
            }
        }
    })
    
                // Créer l'image principale
                const img = document.createElement('img');
                img.src = folderPath + imageNames[0];
                img.alt = 'Image' + i;
                img.id = img.alt;
                let imgId = img.id
                
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
                
                // Créer le imgShower
                img.addEventListener("click", () => {
                    let imgShower = document.querySelector(".imgShower")
                    imgShower.style.display = "flex"
                    
                    let imgShowerCloseBtn = document.getElementById("imgShowerCloseBtn")
                    let imgShowerCtnImg = document.querySelector(".imgShowerCtn__img");
                    let imgShowerDesc = document.querySelector(".imgShowerCtn__desc");
                    
                    let imgToSelect = document.getElementById(imgId);
                    let imgToShowCreator = document.createElement("img");
                    imgToShowCreator.src = imgToSelect.src
                    imgToShowCreator.alt = imgToSelect.alt
                           
                    const showerPrevBtn = document.createElement('button');
                    showerPrevBtn.classList.add('showerPrev-btn');
                    showerPrevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
                    
                    const showerNextBtn = document.createElement('button');
                    showerNextBtn.classList.add('showerNext-btn');
                    showerNextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
                    
                    imgShowerCtnImg.appendChild(imgToShowCreator);
                    imgShowerCtnImg.appendChild(showerPrevBtn)
                    imgShowerCtnImg.appendChild(showerNextBtn)
                    imgShowerDesc.innerHTML = descriptionText;
                    
                    showerPrevBtn.addEventListener("click", () => {
                        nextImage(showerPrevBtn)
                    })
                    
                    showerNextBtn.addEventListener("click", () => {
                        prevImage(showerNextBtn)
                    })
                                     
                    imgShowerCloseBtn.addEventListener("click", () => {
                    
                        imgShower.style.display = "none";
                        imgToShowCreator.remove();
                        imgShowerDesc.innerHTML = "";
                    })

                    getPromotion(folderPath).then(promotion => {
                        if (promotion !== null) {
                            let originalPrice = null;
                            // Vérifier si la div de promotion existe déjà
                            let existingPromotionDiv = imgShowerCtnImg.querySelector('.imgShower__promotion');
                    
                            if (!existingPromotionDiv) {
                                // Si elle n'existe pas, créez-la
                                let imgShowerPromotionDiv = document.createElement("div");
                                imgShowerPromotionDiv.className = "imgShower__promotion";
                                
                                let imgShowerPromotionText = document.createElement("h4");
                                imgShowerPromotionText.innerHTML = "- " + promotion + "%";
                                
                                imgShowerPromotionDiv.appendChild(imgShowerPromotionText);
                                imgShowerCtnImg.appendChild(imgShowerPromotionDiv);
                            }
                            let articlePrice = imgShowerDesc.querySelector('.prixArticle').innerHTML;
                                // Fonction pour extraire un nombre d'une chaîne
                                function extractNumber(str) {
                                    return Number(str.replace(/[^\d]/g, ''));
                                }
                                originalPrice = extractNumber(articlePrice);
                                console.log(originalPrice)
                                updatePriceInImgShower(imgShowerDesc, promotion, originalPrice)
                        } else {
                            let existingPromotionDiv = imgShowerCtnImg.querySelector('.imgShower__promotion');
                            if (existingPromotionDiv) {
                                existingPromotionDiv.remove()
                            }
                        }
                    })
                    
                    //récupération des données du fichier
                    imgShowerCtnImg.dataset.folder = vetementDiv.dataset.folder
                    imgShowerCtnImg.dataset.images = vetementDiv.dataset.images
                })
    
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
                const numFiles = 39; // Remplacez par le nombre de fichiers "accueilX" que vous avez
      
                for (let i = numFiles; i >= 1; i--) {
                    const folderPath = sourceFolder + 'accueil' + i + '/';
                    const imageNames = ['accueil1.jpg', 'accueil2.jpg', 'accueil3.jpg', 'accueil4.jpg', 'accueil5.jpg', 'accueil6.jpg', 'accueil7.jpg', 'accueil8.jpg']; // Remplacez par les noms de vos images
                    const vetementDiv = createVetementDiv(folderPath, imageNames, i);
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

// funtion that make appears promotions
function setupPromotions() {
    const vetementDivs = document.querySelectorAll('.vetement');

    vetementDivs.forEach(vetementDiv => {
        let dataPromotion = vetementDiv.getAttribute('data-promotion');
        if (dataPromotion !== null) {
            // Vérifier si la div vetements__promotion existe déjà
            let existingPromotionDiv = vetementDiv.querySelector('.vetements__promotion');

            if (!existingPromotionDiv) {
                // Si elle n'existe pas, créez-la
                let newPromotionDiv = document.createElement('div');
                newPromotionDiv.className = 'vetements__promotion';

                let newPromotionText = document.createElement('h4');
                newPromotionText.innerHTML = '- ' + dataPromotion + '%';

                newPromotionDiv.appendChild(newPromotionText);
                vetementDiv.appendChild(newPromotionDiv);
            }

            let articlePrice = vetementDiv.querySelector('.prixArticle').innerHTML;
            // Fonction pour extraire un nombre d'une chaîne
            function extractNumber(str) {
                return Number(str.replace(/[^\d]/g, ''));
            }
            let extractedNumber = extractNumber(articlePrice);
            let promotionPrice = extractedNumber * (1 - dataPromotion / 100);

            let articleNewPrice = vetementDiv.querySelector('.prixArticle');
            articleNewPrice.innerHTML = 'Prix : <s>' + extractedNumber + ' €</s>  ' + promotionPrice + ' €';
        } else {
            console.log('no promotion');
        }
    });
}

function updatePriceInImgShower(imgShowerDesc, promotion, originalPrice) {
    // Vérifier si l'élément de prix existe déjà
    let existingPriceElement = imgShowerDesc.querySelector('.prixArticle');

    if (existingPriceElement) {
        let discountedPrice = originalPrice * (1 - promotion / 100);
        existingPriceElement.innerHTML = "Prix : <s>" + originalPrice + " €</s> " + discountedPrice + " €";
    }
}

window.onload = function() {
    setupFilterButtons();
    createAllVetementDivs()
};

window.addEventListener("load", (event) => {
    let pageLoader = document.querySelector(".pageLoader");
    pageLoader.className = "pageLoaderFinished";
})