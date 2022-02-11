#Clover Rescue Team's official Cloverside software installer

clear && echo -e "\v\033[32mRescueClover installation started. Make sure you have a stable internet connection.\v\033[0m"
echo -e "\v\033[35mDownloading the source code from GitHub...\v\033[0m"
git clone https://github.com/DevMBS/CRTClover.git
echo -e "\v\033[35mInstalling the latest stable version of NodeJS and npm...\v\033[0m"
sudo npm cache clean -f && sudo npm install -g n && sudo n install stable
echo -e "\v\033[35mConnecting to your account...\v\033[0m"
if [ -n "$1" ]
then
echo $1 >> './login.txt'
echo -e "\v\033[35mMoving project folder to /var/www/ ...\v\033[0m"
sudo mkdir /var/www/
sudo mv CRTClover /var/www/
sudo mv ./login.txt /var/www/CRTClover
echo -e "\v\033[35mInstalling required npm modules...\v\033[0m"
cd /var/www/CRTClover && sudo npm install --save child_process roslib fs socket.io-client && cd -
echo -e "\v\033[35mSetting up the Rescue Clover server process manager...\v\033[0m"
sudo chmod 777 /var/www/CRTClover/
sudo npm install pm2@latest -g
echo -e "\v\033[32mInstallation successfully completed! Server starts...\v\033[0m"
else
echo "Please copy and paste command from the install tutorial correctly!"
fi