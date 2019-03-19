    # You can try other linux flavors - this also runs on windows(browser headless mode)
    FROM fedora:latest
    # This works on fedora - allows for container X11 using parent host config.
    RUN adduser tester -p tester

    RUN dnf update -y
    RUN dnf install -y git firefox

    RUN dnf install -y fedora-workstation-repositories 'dnf-command(config-manager)' 
    RUN dnf config-manager --set-enabled google-chrome 
    RUN dnf install -y google-chrome-stable

    RUN dnf install -y nodejs xorg-x11-fonts-Type1 PackageKit-gtk3-module libcanberra-gtk3 bzip2

    RUN npm install gulp -g
    RUN npm install parcel -g
    RUN npm install brunch -g

    #Uncomment if you want to use the vs-code editor
    #RUN echo $'[vscode] \n\
#name=Visual Studio Code \n\
#baseurl=https://packages.microsoft.com/yumrepos/vscode \n\
#enabled=1 gpgcheck=1 \n\
#gpgkey=https://packages.microsoft.com/keys/microsoft.asc' > /etc/yum.repos.d/vscode.repo
    #RUN dnf install -y code

    USER tester
    EXPOSE 3080
    
    ENV NPM_CONFIG_LOGLEVEL notice
    ENV NODE_ENV development

    # Once the docker container(test_env) is built, you can try any of the frontends 
    # with a manual install(npm install).
    # It is recommended to remove the existing node_modules directories to conserve space.
    RUN cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests.git 
    RUN cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-vue.git 
    RUN cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-react.git 
    RUN cd ~; git clone https://github.com/DaveO-Home/embedded-acceptance-tests-ng.git

    # Change to correspond with desired repo - defaults to angular
    RUN cd ~/embedded-acceptance-tests-ng; npm install 
    RUN cd ~/embedded-acceptance-tests-ng/public; npm install
    WORKDIR /home/tester/embedded-acceptance-tests-ng