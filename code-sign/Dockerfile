# Use minimal Ubuntu image
FROM ubuntu:latest

# Set non-interactive mode for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies (including latest CMake from Kitware)
RUN apt-get update && apt-get install -y \
    file \
    build-essential \
    software-properties-common \
    wget \
    git \
    libssl-dev \
    libcurl4-openssl-dev \
    zlib1g-dev \
    openssl \
    cmake \
    curl \
    mingw-w64 \
    binutils-mingw-w64 \
    g++-mingw-w64-x86-64 \
    && rm -rf /var/lib/apt/lists/*

# Install Rust using rustup (latest stable version)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Verify Rust installation
RUN rustc --version && cargo --version

# Install cargo-binutils and windres using Rust Crate
RUN cargo install cargo-binutils && \
    rustup component add llvm-tools-preview

# Install apple-codesign from crates.io
RUN cargo install apple-codesign

# Ensure `windres` is available
RUN ln -s /usr/bin/x86_64-w64-mingw32-windres /usr/bin/windres || true

# Set working directory
WORKDIR /app

# Clone and build osslsigncode using CMake 3.17+
RUN git clone https://github.com/mtrojnar/osslsigncode.git && \
    cd osslsigncode && \
    mkdir build && cd build && \
    cmake -S .. && \
    make && \
    make install && \
    cd ../.. && rm -rf osslsigncode  # Cleanup source files

# Copy the certificate generation script
COPY generate_code_sign_cert.sh /app/generate_code_sign_cert.sh

# Copy the EXE signing script
COPY sign_exe.sh /app/sign_exe.sh

# Copy the macOS signing script
COPY sign_macos.sh /app/sign_macos.sh

# Copy the EXE metadata update script
COPY update_exe_metadata.sh /app/update_exe_metadata.sh

# Make both scripts executable
RUN chmod +x /app/generate_code_sign_cert.sh && chmod +x /app/sign_exe.sh && chmod +x /app/sign_macos.sh && chmod +x /app/update_exe_metadata.sh

# Set default shell
CMD ["/bin/bash"]
