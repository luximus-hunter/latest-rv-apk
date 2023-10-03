const revancedApi = "https://api.revanced.app/v2/patches/latest"

const apks = document.getElementById('apks')
const versionLess = document.getElementById('version-less')
const notOnAPKMirror = document.getElementById('not-on-apkmirror')
const footer = document.getElementById('footer')

const packageFromUrl = window.location.search.substring(1)

const currentYear = new Date().getFullYear()
footer.innerHTML = `© ${currentYear} Thomas Lipman`

fetch('./config.json').then(response => response.json()).then(config => {
    fetch(revancedApi).then(res => res.json()).then(data => {
        let packages = data.patches.map(patch => patch.compatiblePackages.map(package => package.name)).flat()
        packages = uniq(packages)
    
        packages.forEach(package => {
            const option = config.find(option => option.package === package)

            if (option) {
                const patches = data.patches.filter(patch => {
                    const supportedPackages = patch.compatiblePackages.map(package => package.name)
                    return supportedPackages.includes(package)
                })

                console.log(patches)

                const versions = patches.map(patch => patch.compatiblePackages.map(package => package.versions).flat()).flat()

                versions.sort ((a, b) => {
                    a = parseInt(a.replace(/\./g, ''))
                    b = parseInt(b.replace(/\./g, ''))
                    return a - b
                })

                const version = versions[versions.length - 1]

                const apk = version ? option.apk.replace(/VERSION/g, version.replace(/\./g, '-')) : option.apk

                if ( packageFromUrl && packageFromUrl == package){
                    window.location.href = apk
                }

                const a = document.createElement('a')
                a.href = apk
                a.innerHTML = version ? `${option.name} (${version})` : option.name

                version ? apks.appendChild(a) : versionLess.appendChild(a)
            } else {
                console.error('No config found for ' + package)

                const s = document.createElement('span')
                s.innerHTML = package
                notOnAPKMirror.appendChild(s)
            }
        })
    })
});

const uniq = (a) => {
    let seen = {};
    return a.filter((item) => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}