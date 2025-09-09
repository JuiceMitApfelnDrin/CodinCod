default:
    @just --list

piston-list-installed:
    @curl --no-progress-meter $PISTON_URI/api/v2/runtimes | jq -r '.[] | "\(.language) \(.version)"' ; \
    echo

piston-list-installable:
    @curl --no-progress-meter $PISTON_URI/api/v2/packages | jq -r '.[] | "\(.language) \(.language_version)"'; \
    echo

piston-install lang version:
    curl --no-progress-meter --json '{"language":"{{lang}}","version":"{{version}}"}' $PISTON_URI/api/v2/packages; \
    echo

piston-remove lang version:
    curl -X DELETE --no-progress-meter --json '{"language":"{{lang}}","version":"{{version}}"}' $PISTON_URI/api/v2/packages

docker-update:
    docker compose pull && docker compose up -d && docker image prune -f

piston-install-latest lang:
    @latest=`just piston-list-installable | grep "^{{lang}} " | sort -V | tail -n1 | awk '{print $2}'` ; \
    if [ -z "$latest" ]; then \
        echo "No versions found for {{lang}}" ; \
    else \
        echo "Installing {{lang}} $latest" ; \
        curl --no-progress-meter --json "{\"language\":\"{{lang}}\",\"version\":\"$latest\"}" $PISTON_URI/api/v2/packages ; \
    fi

# Install latest version of multiple languages
piston-install-latest-multi langs:
    @for lang in {{langs}} ; do \
        just piston-install-latest $$lang ; \ 
    done
