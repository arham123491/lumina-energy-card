from pathlib import Path

path = Path("README.md")
text = path.read_text(encoding="utf-8")


def replace_block(source: str, start: str, end: str, replacement: str) -> str:
    start_idx = source.index(start)
    end_idx = source.index(end, start_idx)
    return source[:start_idx] + replacement + source[end_idx:]


new_fr = """## Français

### Aperçu (FR)

Lumina Energy Card est une carte Lovelace personnalisée pour Home Assistant qui représente des flux d'énergie animés, regroupe les chaînes photovoltaïques et les batteries, et affiche en option les métriques de charge EV dans une mise en page immersive.

### Fonctionnalités clés (FR)

- Jusqu'à six capteurs PV avec étiquetage intelligent par chaîne ou totalisé.
- Jusqu'à quatre systèmes de batteries avec moyenne SOC et visualisation liquide animée.
- Flux animés pour réseau, charge, PV, batterie et EV avec couleurs dynamiques et styles dash/points/flèches sélectionnables.
- Seuil d'animation du réseau configurable (100 W par défaut) pour masquer le bruit d'import/export faible.
- Multiplicateur de vitesse (-3x à 3x, 0 en pause, valeurs négatives inversent) et seuils de visibilité dédiés pour chaque flux.
- Panneau EV optionnel incluant puissance et SOC, couleurs et typographie personnalisables, avec prise en charge de deux véhicules.
- Badge de production quotidienne et commandes typographiques complètes pour l'en-tête, les PV, les batteries, la charge, le réseau et l'EV.
- Totaux quotidiens d'import et d'export du réseau lorsque les capteurs correspondants sont fournis.
- Couleurs d'avertissement/critique pour la charge domestique et seuil SOC bas configurable pour le remplissage liquide de la batterie.
- Curseur d'intervalle de mise à jour (0–60 s, valeur par défaut 30 s) avec rafraîchissement temps réel si réglé sur 0 s.
- Trois popups d'information (Maison, Solaire, Batterie) avec six lignes configurables (nom, couleur, taille de police).
- Prise en charge d'un second onduleur, d'un flux pompe à chaleur dédié et d'autres évolutions à venir.

### Installation (FR)

#### HACS (FR)

1. Ouvrez HACS dans Home Assistant et choisissez **Frontend**.
1. Cliquez sur le menu à trois points et sélectionnez **Custom repositories**.
1. Collez `https://github.com/ratava/lumina-energy-card`, définissez la catégorie sur **Frontend**, puis cliquez sur **Add**.
1. Fermez la boîte, trouvez **Lumina Energy Card** dans la liste Frontend et installez-la.
1. Redémarrez Home Assistant si nécessaire, puis ajoutez la carte depuis l'éditeur Lovelace.

#### Installation manuelle (FR)

1. Téléchargez `dist/lumina-energy-card.js` depuis la [dernière release](https://github.com/ratava/lumina-energy-card/releases).
1. Copiez le fichier dans `/config/www/community/lumina-energy-card/`.
1. Placez `dist/lumina_background.png` dans le même dossier.
1. Ajoutez la ressource Lovelace :

```yaml
lovelace:
  resources:
    - url: /local/community/lumina-energy-card/lumina-energy-card.js
      type: module
```

1. Redémarrez Home Assistant pour charger la ressource.

### Configuration (FR)

1. Éditez votre tableau de bord et cliquez sur **Add Card**.
1. Recherchez **Lumina Energy Card**.
1. Remplissez les champs à l'aide des sélecteurs d'entités et des bascules.
1. Ajustez l'intervalle de mise à jour (**Update Interval**) selon vos besoins.

Exemple YAML minimal (FR) :

```yaml
type: custom:lumina-energy-card
sensor_pv1: sensor.solar_production
sensor_daily: sensor.daily_production
sensor_bat1_soc: sensor.battery_soc
sensor_bat1_power: sensor.battery_power
sensor_home_load: sensor.home_consumption
sensor_grid_power: sensor.grid_power
background_image: /local/community/lumina-energy-card/lumina_background.png
```

### Options (FR)

| Option | Type | Par défaut | Remarques |
| --- | --- | --- | --- |
| `card_title` | chaîne | — | Texte d'en-tête optionnel ; vide = titre masqué. |
| `background_image` | chaîne | `/local/community/lumina-energy-card/lumina_background.png` | Image de fond 16:9 par défaut. |
| `background_image_heat_pump` | chaîne | `/local/community/lumina-energy-card/lumina-energy-card-hp.png` | Chargée automatiquement lorsqu'un capteur de pompe à chaleur est configuré. |
| `language` | chaîne | `en` | Langues prises en charge : `en`, `it`, `de`, `fr`, `nl`. |
| `display_unit` | chaîne | `kW` | Affiche les valeurs en `W` ou `kW`. |
| `update_interval` | nombre | `30` | Cadence d'actualisation (0–60 s, pas de 5 ; 0 supprime toute limitation). |
| `animation_speed_factor` | nombre | `1` | Multiplicateur des flux (-3 à 3 ; 0 met en pause, valeurs négatives inversent). |
| `animation_style` | chaîne | `dashes` | Motif des flux (`dashes`, `dots`, `arrows`). |
| `grid_flow_mode` | chaîne | `grid_to_inverter` | Choisit le tracé réseau unique ou le mode scindé `grid_to_house_inverter`. |
| `header_font_size` | nombre | `16` | Taille de police de l'en-tête (12–32 px). |
| `daily_label_font_size` | nombre | `12` | Taille de l'étiquette quotidienne (8–24 px). |
| `daily_value_font_size` | nombre | `20` | Taille du total quotidien (12–32 px). |
| `pv_font_size` | nombre | `16` | Taille du texte PV (12–28 px). |
| `battery_soc_font_size` | nombre | `20` | Taille du libellé SOC (12–32 px). |
| `battery_power_font_size` | nombre | `14` | Taille du texte puissance batterie (10–28 px). |
| `load_font_size` | nombre | `15` | Taille du texte de charge (10–28 px). |
| `grid_font_size` | nombre | `15` | Taille du texte réseau (10–28 px). |
| `heat_pump_font_size` | nombre | `16` | Taille du texte pompe à chaleur (10–28 px). |
| `car_power_font_size` | nombre | `15` | Taille du texte puissance voiture 1 (10–28 px). |
| `car2_power_font_size` | nombre | `15` | Taille du texte puissance voiture 2 (10–28 px, retombe sur Car 1 si absent). |
| `car_soc_font_size` | nombre | `12` | Taille du SOC voiture 1 (8–24 px). |
| `car2_soc_font_size` | nombre | `12` | Taille du SOC voiture 2 (8–24 px, retombe sur Car 1). |
| `car_name_font_size` | nombre | `15` | Taille du nom de la voiture 1. |
| `car2_name_font_size` | nombre | `15` | Taille du nom de la voiture 2. |
| `sensor_pv_total` | entité | — | Capteur PV total optionnel. Fournissez ce capteur **ou** au moins une chaîne PV. |
| `sensor_pv1` .. `sensor_pv6` | entité | — | Capteurs PV par chaîne pour Array 1. Sans total, au moins une chaîne est requise et toutes les chaînes configurées sont additionnées. |
| `show_pv_strings` | booléen | `false` | Affiche le total PV ainsi que chaque chaîne configurée. |
| `sensor_daily` | entité | — | Capteur de production quotidienne (obligatoire). |
| `sensor_bat1_soc` | entité | — | Capteur SOC batterie (obligatoire si une batterie apparaît). |
| `sensor_bat1_power` | entité | — | Capteur de puissance batterie (obligatoire si une batterie apparaît). |
| `sensor_home_load` | entité | — | Capteur de charge domestique (obligatoire). |
| `sensor_grid_power` | entité | — | Capteur net réseau (obligatoire sauf si import/export séparés fournis). |
| `sensor_grid_import` | entité | — | Capteur d'import positif facultatif. |
| `sensor_grid_export` | entité | — | Capteur d'export positif facultatif. |
| `sensor_grid_import_daily` | entité | — | Capteur d'import quotidien cumulé (facultatif). |
| `sensor_grid_export_daily` | entité | — | Capteur d'export quotidien cumulé (facultatif). |
| `show_daily_grid` | booléen | `false` | Affiche les totaux d'import/export quotidiens au-dessus de la valeur live. |
| `show_grid_flow_label` | booléen | `true` | Ajoute « Importation » ou « Exportation » avant la valeur réseau. |
| `sensor_heat_pump_consumption` | entité | — | Capteur pompe à chaleur ; active le flux orange et l'arrière-plan dédié. |
| `sensor_car_power` | entité | — | Capteur de puissance de charge voiture 1 (facultatif). |
| `sensor_car_soc` | entité | — | Capteur SOC voiture 1 (facultatif). |
| `sensor_car2_power` | entité | — | Capteur de puissance de charge voiture 2 (facultatif). |
| `sensor_car2_soc` | entité | — | Capteur SOC voiture 2 (facultatif). |
| `show_car_soc` | booléen | `false` | Affiche le panneau voiture 1 (puissance + SOC). |
| `show_car2` | booléen | `false` | Affiche le panneau voiture 2 lorsque des capteurs sont fournis. |
| `car_flow_color` | chaîne | `#00FFFF` | Couleur du flux EV. |
| `car1_color` | chaîne | `#FFFFFF` | Couleur du texte puissance voiture 1. |
| `car2_color` | chaîne | `#FFFFFF` | Couleur du texte puissance voiture 2. |
| `car_pct_color` | chaîne | `#00FFFF` | Couleur du texte SOC voiture 1. |
| `car2_pct_color` | chaîne | `#00FFFF` | Couleur du texte SOC voiture 2. |
| `car1_name_color` | chaîne | `#FFFFFF` | Couleur du nom voiture 1. |
| `car2_name_color` | chaîne | `#FFFFFF` | Couleur du nom voiture 2. |
| `pv_primary_color` | chaîne | `#0080ff` | Couleur d'animation du flux PV principal. |
| `pv_secondary_color` | chaîne | `#80ffff` | Couleur du flux PV secondaire. |
| `pv_tot_color` | chaîne | `#00FFFF` | Couleur de la ligne/texte PV TOTAL. |
| `load_flow_color` | chaîne | `#0080ff` | Couleur du flux de charge domestique. |
| `load_threshold_warning` | nombre | — | Seuil d'avertissement pour la charge (W ou kW). |
| `load_warning_color` | chaîne | `#ff8000` | Couleur d'avertissement pour la charge. |
| `load_threshold_critical` | nombre | — | Seuil critique pour la charge (W ou kW). |
| `load_critical_color` | chaîne | `#ff0000` | Couleur critique pour la charge. |
| `battery_charge_color` | chaîne | `#00FFFF` | Couleur du flux de charge batterie. |
| `battery_discharge_color` | chaîne | `#FFFFFF` | Couleur du flux de décharge batterie. |
| `grid_import_color` | chaîne | `#FF3333` | Couleur du flux d'import réseau. |
| `grid_export_color` | chaîne | `#00ff00` | Couleur du flux d'export réseau. |
| `heat_pump_flow_color` | chaîne | `#FFA500` | Couleur du flux dédié pompe à chaleur. |
| `heat_pump_text_color` | chaîne | `#FFA500` | Couleur du texte pompe à chaleur. |
| `battery_fill_high_color` | chaîne | `#00ffff` | Couleur de remplissage batterie au-dessus du seuil bas. |
| `battery_fill_low_color` | chaîne | `#ff0000` | Couleur de remplissage batterie sous le seuil bas. |
| `battery_fill_low_threshold` | nombre | `25` | Pourcentage SOC qui déclenche la couleur basse. |
| `grid_activity_threshold` | nombre | `100` | Puissance réseau minimale (W) avant animation. |
| `grid_threshold_warning` | nombre | — | Seuil déclenchant la couleur d'avertissement réseau. |
| `grid_warning_color` | chaîne | `#ff8000` | Couleur d'avertissement réseau. |
| `grid_threshold_critical` | nombre | — | Seuil déclenchant la couleur critique réseau. |
| `grid_critical_color` | chaîne | `#ff0000` | Couleur critique réseau. |
| `invert_grid` | booléen | `false` | Inverse l'import/export si la polarité est inversée. |
| `invert_battery` | booléen | `false` | Inverse la polarité et les couleurs de charge/décharge batterie. |

### Superposition pompe à chaleur (FR)

Définissez `sensor_heat_pump_consumption` pour activer le conduit dédié : la carte charge automatiquement `background_image_heat_pump`, affiche la consommation en orange près de la maison et anime la conduite. Ajustez `heat_pump_flow_color`, `heat_pump_text_color` et `heat_pump_font_size` si nécessaire.

```yaml
type: custom:lumina-energy-card
sensor_heat_pump_consumption: sensor.heat_pump_power
background_image_heat_pump: /local/community/lumina-energy-card/lumina-energy-card-hp.png
heat_pump_flow_color: '#FFAA33'
heat_pump_text_color: '#FFE1B2'
```

### Modes de flux réseau (FR)

`grid_flow_mode` contrôle la façon dont les importations sont dessinées :

- `grid_to_inverter` (par défaut) dessine une seule trajectoire vers l'onduleur.
- `grid_to_house_inverter` scinde l'animation en deux traits (réseau→maison et maison→onduleur) pour distinguer la part alimentant directement la maison.

```yaml
type: custom:lumina-energy-card
sensor_grid_power: sensor.grid_net_power
grid_flow_mode: grid_to_house_inverter
grid_activity_threshold: 50
```

### Popups (FR)

Les trois groupes de popups (PV, Maison, Batterie) offrent chacun six emplacements avec entité, nom facultatif, couleur et taille de police. Les valeurs sont affichées telles quelles pour permettre l'utilisation de capteurs numériques ou textuels.

- Popup PV
  - `sensor_popup_pv_1` .. `sensor_popup_pv_6` : entités à afficher.
  - `sensor_popup_pv_1_name` .. `sensor_popup_pv_6_name` : noms personnalisés facultatifs.
  - `sensor_popup_pv_1_color` .. `sensor_popup_pv_6_color` : couleurs par ligne (défaut `#80ffff`).
  - `sensor_popup_pv_1_font_size` .. `sensor_popup_pv_6_font_size` : tailles de police (px) (défaut `14`).
  - Zones cliquables : le badge de production quotidienne et les panneaux solaires ouvrent/ferment le popup ; cliquer sur le popup le masque.

- Popup Maison
  - `sensor_popup_house_1` .. `sensor_popup_house_6` : entités à afficher.
  - `sensor_popup_house_1_name` .. `sensor_popup_house_6_name` : noms facultatifs.
  - `sensor_popup_house_1_color` .. `sensor_popup_house_6_color` : couleurs (défaut `#80ffff`).
  - `sensor_popup_house_1_font_size` .. `sensor_popup_house_6_font_size` : tailles de police (px) (défaut `14`).
  - La maison est cliquable pour ouvrir/fermer le popup ; cliquer sur le popup le ferme.

- Popup Batterie
  - `sensor_popup_bat_1` .. `sensor_popup_bat_6` : entités à afficher.
  - `sensor_popup_bat_1_name` .. `sensor_popup_bat_6_name` : noms facultatifs.
  - `sensor_popup_bat_1_color` .. `sensor_popup_bat_6_color` : couleurs (défaut `#80ffff`).
  - `sensor_popup_bat_1_font_size` .. `sensor_popup_bat_6_font_size` : tailles de police (px) (défaut `16`).
  - La batterie est cliquable ; cliquer dessus ouvre/ferme le popup, cliquer sur le popup le ferme.

### Options supplémentaires Array 2 (FR)

| Option | Type | Par défaut | Remarques |
| --- | --- | --- | --- |
| `sensor_pv_total_secondary` | entité | — | Capteur total optionnel pour le deuxième onduleur (PV2). Ajouté à PV TOT et alimente le flux PV secondaire. |
| `sensor_pv_array2_1` .. `sensor_pv_array2_6` | entités | — | Jusqu'à six capteurs par chaîne pour Array 2 ; visibles individuellement si `show_pv_strings` est activé. |
| `sensor_daily_array2` | entité | — | Capteur de production quotidienne pour Array 2 ; total quotidien = `sensor_daily` + `sensor_daily_array2`. |
| `sensor_home_load_secondary` | entité | — | Capteur de charge maison lié à l'onduleur 2 ; requis pour HOUSE TOT / INV 2 lorsque Array 2 est actif. |
| `pv_tot_color` | chaîne | `#00FFFF` | Remplace la couleur de la ligne/texte PV TOTAL (affecte aussi les chaînes). |
| `house_total_color` / `inv1_color` / `inv2_color` | chaîne | — | Couleurs par ligne pour HOUSE TOT, INV 1 et INV 2. |
| `invert_battery` | booléen | `false` | Inverse la polarité et la direction d'animation de la batterie. |

Couleurs et polices des voitures : `car1_name_color`, `car2_name_color`, `car1_color`, `car2_color`, `car_pct_color`, `car2_pct_color`, `car_name_font_size`, `car2_name_font_size` permettent d'aligner les panneaux Car 1 et Car 2 (les tailles de puissance/SOC restent contrôlées par les options principales).

Notes :

- Lorsque Array 2 est actif : `pv1` alimente l'Array 1 (primaire) et `pv2` l'Array 2 (secondaire). La ligne PV TOT affiche la production combinée.
- Avec `show_pv_strings`, la carte affiche PV TOT / Array 1 / Array 2 ainsi que `HOUSE TOT / INV 1 / INV 2` dans la section Maison.

### Fond & Dépannage (FR)

- Fond par défaut : `/local/community/lumina-energy-card/lumina_background.png` (copiez votre image à côté du fichier JS pour personnaliser).
- Dimensions recommandées : 800×450 (16:9).
- Carte manquante : vérifiez que la ressource est ajoutée et videz le cache du navigateur.
- Valeurs nulles : contrôlez les IDs d'entités et la disponibilité des capteurs.
- Éditeur lent : augmentez `update_interval` ou réduisez la fréquence de rafraîchissement du tableau de bord.

### Support & Licence (FR)

- Licence : MIT (voir [LICENSE](LICENSE)).
- Problèmes et demandes de fonctionnalités : ouvrez un ticket sur [GitHub](https://github.com/ratava/lumina-energy-card).

### Changelog (FR)

- **1.1.25 (2025-12-26)** – Increment de version (reportez-vous à l'entrée précédente pour les nouveautés).
- **1.1.20 (2025)** – Ajustement de l'échelle des flèches, seuil d'animation réseau, bascule du panneau EV et rafraîchissement de la documentation.
- **1.1.18 (2025)** – Ajout des styles d'animation (tirets, points, flèches) et mise à jour de la documentation.
- **1.1.13 (2025)** – Ajout de l'easing pour la durée des flux, nettoyage des garde-fous et option d'intervalle 0 s pour un rafraîchissement en temps réel.
- **1.1.1 (2025)** – Localisation des textes et préparation de la distribution en fichier unique.
- **1.1.0 (2025)** – Localisation des onglets de configuration anglais/italien/allemand et distribution monofichier.
- **1.0.8 (2025)** – Contrôles de typographie convertis en champs texte avec les paramètres EV.
- **1.0.7 (2025)** – Rétablissement des contrôles de typographie dans la nouvelle mise en page de l'éditeur.
- **1.0.5 (2025)** – Refonte de l'éditeur Lovelace avec sélecteurs natifs et mises à jour instantanées.
- **1.0.4 (2025)** – Fusion de l'éditeur dans le bundle principal et ajout d'onglets localisés pour la configuration.
- **1.0.3 (2025)** – Ajout du réglage de vitesse d'animation, des curseurs de typographie et des exemples d'entités en ligne.
- **1.0.2 (2025)** – Mise à jour de la base de code.
- **1.0.1 (2025)** – Déplacement des fichiers distribuables dans `dist/` et alignement de l'installation manuelle.

---
"""

# ... remainder of script truncated for brevity
