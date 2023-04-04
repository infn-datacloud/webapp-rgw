FROM python:3.11-slim-bullseye

ARG USERNAME="backend"

RUN apt-get update && apt-get install curl -y && \
  apt-get clean && \
  rm -rf /var/apt/cache && \
  pip install --upgrade pip && \
  useradd -m ${USERNAME}

USER ${USERNAME}
WORKDIR /app

COPY --chown=${USERNAME}:${USERNAME} src/ /app
COPY --chown=${USERNAME}:${USERNAME} requirements.txt .
ENV PATH="/home/${USERNAME}/.local/bin:${PATH}"

RUN pip install -r requirements.txt && \
  pip cache purge && \
  rm requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload", "--reload-dir", "/app"]