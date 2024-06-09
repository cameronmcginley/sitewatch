# # Use the Amazon Linux base image for Python 3.10
# FROM amazonlinux:2

# # Install necessary packages
# RUN yum update -y && \
#     yum install -y \
#     gcc \
#     openssl-devel \
#     bzip2-devel \
#     libffi-devel \
#     zlib-devel \
#     make \
#     tar \
#     gzip \
#     wget

# # Install Python 3.10
# RUN cd /usr/src && \
#     wget https://www.python.org/ftp/python/3.10.5/Python-3.10.5.tgz && \
#     tar xzf Python-3.10.5.tgz && \
#     cd Python-3.10.5 && \
#     ./configure --enable-optimizations && \
#     make altinstall

# # Ensure the new Python binaries are in PATH
# RUN ln -s /usr/local/bin/python3.10 /usr/bin/python3.10 && \
#     ln -s /usr/local/bin/pip3.10 /usr/bin/pip3.10

# # Set up a virtual environment
# RUN python3.10 -m venv /env
# ENV PATH="/env/bin:$PATH"

# # Install necessary Python packages
# COPY requirements.txt /app/requirements.txt
# RUN pip install --upgrade pip && \
#     pip install -r /app/requirements.txt

# # Create a directory for the Lambda function
# RUN mkdir -p /app/package
# WORKDIR /app/package

# # Copy the Lambda function code
# COPY lambda_function.py utils.py links.py /app/package/

# # Copy installed packages to the package directory
# RUN cp -r /env/lib/python3.10/site-packages/* /app/package/

# # Create a deployment package
# RUN zip -r9 /app/lambda_function.zip .
FROM public.ecr.aws/lambda/python:3.10

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install the specified packages
RUN pip install -r requirements.txt

# Copy function code
COPY lambda_function.py ${LAMBDA_TASK_ROOT}

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "lambda_function.handler" ]