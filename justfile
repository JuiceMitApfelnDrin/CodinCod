default:
    @just --list

piston-list-installed:
    @curl --no-progress-meter $PISTON_URI/api/v2/runtimes | jq -r '.[] | "\(.language) \(.version)"'

piston-list-installable:
    @curl --no-progress-meter $PISTON_URI/api/v2/packages | jq -r '.[] | "\(.language) \(.language_version)"'

piston-install lang version:
    curl --no-progress-meter --json '{"language":"{{lang}}","version":"{{version}}"}' $PISTON_URI/api/v2/packages

piston-remove lang version:
    curl -X DELETE --no-progress-meter --json '{"language":"{{lang}}","version":"{{version}}"}' $PISTON_URI/api/v2/packages

docker-update:
    docker compose pull && docker compose up -d && docker image prune -f