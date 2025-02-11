var controleur;
var canalsocketio;
var connexion_utilisateur;

window.addEventListener("load",init, false);

function init(e){
	controleur=new Controleur();
	canalsocketio=new CanalSocketio(io,controleur,"canalsocketio");
	connexion_utilisateur=new ConnexionUtilisateur(document.getElementById("login"),controleur,"connexion_utilisateur");
}
