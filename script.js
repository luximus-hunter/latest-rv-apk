const revancedApi = "https://api.revanced.app/v2/patches/latest"

const redirecting = document.getElementById('redirecting')
const columns = document.getElementById('columns')
const apks = document.getElementById('apks')
const versionLess = document.getElementById('version-less')
const notOnAPKMirror = document.getElementById('not-on-apkmirror')
const footer = document.getElementById('footer')

const packageFromUrl = window.location.search.substring(1)

const currentYear = new Date().getFullYear()
footer.innerHTML = `© ${currentYear} Thomas Lipman`

if (packageFromUrl) {
    redirecting.classList.remove('hidden')
    columns.classList.add('hidden')
}

fetch('./config.json').then(response => response.json()).then(config => {
    fetch(revancedApi).then(res => res.json()).then(data => {

        let packages = data.patches.map(patch => {
            if (!patch.compatiblePackages) {
                return patch.package
            }
            const d = patch.compatiblePackages.map(package => package.name)
            return d
        }).flat()
        packages = uniq(packages)

        packages = packages.sort((a, b) => {
            a = a.toLowerCase()
            b = b.toLowerCase()
            if (a < b) {
                return -1
            }
            if (a > b) {
                return 1
            }
            return 0
        })
    
        packages.forEach(package => {
            const option = config.find(option => option.package === package)

            if (option) {
                const patches = data.patches.filter(patch => {            
                    if (!patch.compatiblePackages) {
                        return patch.package
                    }
                    const supportedPackages = patch.compatiblePackages.map(package => package.name)
                    return supportedPackages.includes(package)
                })

                console.log(patches.map(patch => patch.name).flat())

                const versions = patches.map(patch => patch.compatiblePackages.map(package => package.versions).flat()).flat()

                versions.sort ((a, b) => {
                    if (!a || !b) {
                        return 0
                    }
                    a = parseInt(a.replace(/\./g, ''))
                    b = parseInt(b.replace(/\./g, ''))
                    return a - b
                })

                const version = versions[versions.length - 1]

                const apk = version ? option.apk.replace(/VERSION/g, version.replace(/\./g, '-')) : option.apk

                if ( packageFromUrl && packageFromUrl == package){
                    const span = document.createElement('span')
                    span.innerHTML = `Redirecting you to ${version ? `${option.name} (${version})` : option.name}`
                    redirecting.appendChild(span)

                    const link = document.createElement('a')
                    link.href = apk
                    link.innerHTML = 'Click here if you are not redirected'
                    redirecting.appendChild(link)

                    window.location.href = apk
                }

                const a = document.createElement('a')
                a.href = apk
                a.innerHTML = version ? `${option.name} (${version})` : option.name

                version ? apks.appendChild(a) : versionLess.appendChild(a)

                console.info(`Found config for ${package}`)
            } else {
                console.error('No config found for ' + package)

                if (!package) {
                    return
                }

                const s = document.createElement('span')
                s.innerHTML = `${package}`
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