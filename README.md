# sea-webpack-plugin

[![RIKSOF, Inc](https://d37up8ah6d53fh.cloudfront.net/default/1.0.2-a4413db/builds/assets/common/images/navs/rs-logo-old.png)](https://www.riksof.com/)  
[![s2a](https://d4i3gppt7py8y.cloudfront.net/default/1.0.1-c6907ac/builds/assets/common/images/navs/logo-s2a.png)](https://www.s2a.io/)  

*A Webpack plugin for cross-platform generation of Node's SEA (Single executable applications).*

## 📖 Overview
The sea-webpack-plugin is a Webpack plugin designed to create Node’s single executable applications (SEA), offering cross-platform builds (Windows, macOS, and Linux) from any environment. It streamlines the process of bundling Node.js apps into a single file—automatically downloading the required Node.js binary, generating a SEA configuration file, and embedding assets into the final executable.

## ✨ Features
- 🏗 **Automates SEA Configuration** – Generates `sea-config.json` for packaging Node.js applications.
- ⬇️ **Automatic Node.js Download & Caching** – Downloads Node.js for specified platforms and caches it for future use.
- 📂 **Assets Manifest Generation** – Embeds assets into the SEA configuration.
- 🏆 **Multi-Platform Support** – Supports Windows, macOS, and Linux builds.

## 🚀 Installation
Install sea-webpack-plugin using npm or yarn:

```sh
npm install --save-dev sea-webpack-plugin
```

or

```sh
yarn add --dev sea-webpack-plugin
```

## ⚙️ Usage

### **Basic Webpack Configuration**
Add sea-webpack-plugin to your Webpack configuration:

```javascript
import SeaWebpackPlugin from 'sea-webpack-plugin';
import path from 'path';

export default {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new SeaWebpackPlugin({
      name: 'my-app',
      nodeVersion: '23.9.0',
      os: ['win-x64', 'linux-x64', 'darwin-x64', 'darwin-arm64']
      assets: {
        'assets/icon.jpg': { 
          src: 'src/assets/icon.jpg', 
          options: { 
            /*any custom options */
          } 
        },
        'assets/logo.png': { 
          src: 'src/assets/logo.png',
          options: { 
            /*any custom options */
          }
        }
      }
    })
  ]
};
```
The following apps will be published to the dist folder: *my-app-win-x64.exe*, *my-app-linux-x64*, *my-app-darwin-x64* and *my-app-darwin-arm64*.

## 🔧 Configuration Options

| Option        | Type               | Description |
|--------------|----------------|-------------|
| `name`        | `string`         | Name of the output executable. *Default:* name of the output bundle. |
| `nodeVersion` | `string`         | Version of Node.js to be used in SEA. This must be the same version as the version being used to build the bundle. *Default:* 23.9.0. |
| `os`          | `string | string[]` | Target platform(s) (e.g., `win-x64`, `linux-x64`, `darwin-x64` - mac on x86, `darwin-arm64` - mac on M* chips). |
| `cachePath`   | `string`         | Path to store downloaded Node.js binaries *Default:* `.node_cache` in outputPath. |
| `assets`      | `object`         | A key-value map of asset files to be embedded. This json is also dumped in to the assets as `manifest.json`. Any properties passed in the options can be read using this file. To access the assets in the executable, use node functions `sea.getAsset`, `sea.getAssetAsBlob` and `sea.getRawAsset`. |

## 📜 License
This project is licensed under the MIT License.


## 🤖 AI Assisted Development
sea-webpack-plugin was developed with the help of AI, enabling the team to complete a fully functional release in just 8 hours.

## 🐳 Using the Docker (Code-Signing)
This plugin ships with a Dockerfile to facilitate cross-plafrom code signing for your SEA builds. You can find this Docker configurations in the `code-sign` folder:

1. **Build the Docker Image**
    ```sh
    cd code-sign
    docker build -t code-signing-docker .
    ```

2. **Generate self signed code certificates (Optional)**
    *Usage:*
    ```sh
    docker run --rm -v <absolute path to the certs folder>:/certs -it code-signing-docker /app/generate_code_sign_cert.sh <country_code> <organization_name> <password> <cert_path>
    ```

    *Example:*
    ```sh
    docker run --rm -v /home/john/certs:/certs -it code-signing-docker /app/generate_code_sign_cert.sh US "RIKSOF Inc" **** /cert/my_app_cert_self
    ```

3. **Sign the Windows build**
    *Usage:*
    ```sh
    docker run --rm -v <absolute path to the certs folder>:/certs <absolute path to the project folder>:/project /app/sign_exe.sh /project/<path_to_exe> /certs/<key_file> <password> <application_name> <url>
    ```

    *Example:*
    ```sh
    docker run --rm -v /home/john/certs:/certs -v /home/john/project:/project -it code-signing-docker /app/sign_exe.sh /project/dist/my-app-win-x64.exe /cert/my_app_cert_self.pfx *** "Application Name" https://www.mydomain.com
    ```

4. **Sign the Mac OS build**
    *Usage:*
    ```sh
    docker run --rm -v <absolute path to the certs folder>:/certs <absolute path to the project folder>:/project /app/sign_macos.sh /project/<executable_path> /certs/<p12/pfx_file> <p12_password> <identifier>
    ```

    *Example:*
    ```sh
    docker run --rm -v /home/john/certs:/certs -v /home/john/project:/project -it code-signing-docker /app/sign_macos.sh /project/dist/my-app-darwin-arm64 /cert/my_app_cert_self_macos.pfx *** com.domain.my-app
    ```

This approach ensures your executables are properly signed and trusted across multiple platforms, further streamlining your SEA distribution.

---

© 2024 SeaPlugin. All rights reserved.
