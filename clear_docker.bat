# chạy từng dòng bằng powershell adminstrator

docker system prune -a --volumes -f
docker builder prune --all -f 
wsl --shutdown
Import-Module Hyper-V & 
Optimize-VHD -Path 'C:\Users\truon\AppData\Local\Docker\wsl\disk\docker_data.vhdx' -Mode Full