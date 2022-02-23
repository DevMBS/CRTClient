#Clover Rescue Team's official Cloverside software uninstaller

clear && echo -e "\v\033[31mThis program started deleting RescueClover software from your drone. We hope you know what you are doing and understand the consequences :)\v\033[0m"
pm2 stop /var/www/CRTClover/server.js
pm2 unstartup
sudo rm -r /var/www/CRTClover/

echo -e "\v\033[31mYou need to restart your drone to complete uninstalling.\v\033[0m"