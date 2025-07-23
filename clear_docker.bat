# chạy từng dòng bằng powershell adminstrator

docker system prune -a --volumes -f
docker builder prune --all -f 
tắt docker bằng tay
wsl --shutdown
Import-Module Hyper-V
Optimize-VHD -Path 'D:\WORK\TEAM\DOCKER\DockerDesktopWSL\disk\docker_data.vhdx' -Mode Full