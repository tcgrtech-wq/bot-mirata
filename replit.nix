{ pkgs }: {
  deps = [
    pkgs.glib
    pkgs.nss
    pkgs.fontconfig
    pkgs.xorg.libXcursor
    pkgs.xorg.libXrandr
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXdamage
    pkgs.xorg.libXext
    pkgs.xorg.libXfixes
    pkgs.xorg.libXrender
    pkgs.xorg.libXtst
    pkgs.xorg.libXScrnSaver
    pkgs.at-spi2-atk
    pkgs.gtk3
  ];
}