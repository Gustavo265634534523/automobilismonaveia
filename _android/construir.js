// Monta o app do Android (assets/app/na-veia.apk) sem Android Studio: aapt2 + javac + d8 + zipalign + apksigner.
// Uso: node _android/construir.js
// Ferramentas em _brutos/android-ferramentas (Java 17, build-tools 34, android-34). A chave de assinatura fica em
// _privado/android-chave.p12 (fora do GitHub): sem ela, as próximas versões não instalam por cima da antiga.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const FERR = path.join(RAIZ, '_brutos/android-ferramentas');
const JDK = path.join(FERR, fs.readdirSync(FERR).find(n => n.startsWith('jdk-')));
const BT = path.join(FERR, 'android-14');
const ANDROID_JAR = path.join(FERR, 'android-34/android.jar');
const OBRA = path.join(RAIZ, '_brutos/android-obra');
const SAIDA = path.join(RAIZ, 'assets/app/na-veia.apk');
const CHAVE = path.join(RAIZ, '_privado/android-chave.p12');
const SENHA = path.join(RAIZ, '_privado/android-chave.txt');
const VERSAO = path.join(__dirname, 'versao.json');

const env = Object.assign({}, process.env, { JAVA_HOME: JDK, PATH: path.join(JDK, 'bin') + path.delimiter + process.env.PATH });
function roda(exe, args, opc) {
  return execFileSync(exe, args, Object.assign({ env, stdio: ['ignore', 'pipe', 'inherit'] }, opc || {})).toString();
}
/* d8 e apksigner direto pelo Java (os .bat quebram com o espaço em "Meu site") */
const JAVA = path.join(JDK, 'bin/java.exe');
function jar(nome, args) { return roda(JAVA, ['-cp', path.join(BT, 'lib', nome + '.jar')].concat(args)); }
function arquivos(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? arquivos(path.join(dir, e.name), ext) : e.name.endsWith(ext) ? [path.join(dir, e.name)] : []);
}

/* versão: sobe 1 a cada montagem */
const v = fs.existsSync(VERSAO) ? JSON.parse(fs.readFileSync(VERSAO, 'utf8')) : { codigo: 0 };
v.codigo += 1;
v.nome = '1.' + (v.codigo - 1);

fs.rmSync(OBRA, { recursive: true, force: true });
['gen', 'classes', 'dex'].forEach(d => fs.mkdirSync(path.join(OBRA, d), { recursive: true }));

/* 1. recursos */
roda(path.join(BT, 'aapt2.exe'), ['compile', '--dir', path.join(__dirname, 'res'), '-o', path.join(OBRA, 'res.zip')]);
roda(path.join(BT, 'aapt2.exe'), ['link', '-o', path.join(OBRA, 'base.apk'), '-I', ANDROID_JAR,
  '--manifest', path.join(__dirname, 'AndroidManifest.xml'), '--java', path.join(OBRA, 'gen'),
  '--min-sdk-version', '26', '--target-sdk-version', '34', '--version-code', String(v.codigo), '--version-name', v.nome,
  path.join(OBRA, 'res.zip')]);

/* 2. código */
const fontes = arquivos(path.join(__dirname, 'src'), '.java').concat(arquivos(path.join(OBRA, 'gen'), '.java'));
roda(path.join(JDK, 'bin/javac.exe'), ['--release', '11', '-encoding', 'UTF-8', '-nowarn', '-classpath', ANDROID_JAR, '-d', path.join(OBRA, 'classes')].concat(fontes));
jar('d8', ['com.android.tools.r8.D8', '--release', '--min-api', '26', '--lib', ANDROID_JAR, '--output', path.join(OBRA, 'dex')].concat(arquivos(path.join(OBRA, 'classes'), '.class')));
roda(path.join(BT, 'aapt.exe'), ['add', path.join(OBRA, 'base.apk'), 'classes.dex'], { cwd: path.join(OBRA, 'dex') });

/* 3. alinhar e assinar */
roda(path.join(BT, 'zipalign.exe'), ['-p', '-f', '4', path.join(OBRA, 'base.apk'), path.join(OBRA, 'alinhado.apk')]);
if (!fs.existsSync(CHAVE)) {
  fs.mkdirSync(path.dirname(CHAVE), { recursive: true });
  fs.writeFileSync(SENHA, crypto.randomBytes(24).toString('hex'));
  roda(path.join(JDK, 'bin/keytool.exe'), ['-genkeypair', '-storetype', 'PKCS12', '-keystore', CHAVE, '-alias', 'naveia', '-keyalg', 'RSA', '-keysize', '3072',
    '-validity', '10000', '-dname', 'CN=Automobilismo Na Veia, O=Automobilismo Na Veia, C=BR', '-storepass:file', SENHA, '-keypass:file', SENHA]);
  console.log('chave nova criada em _privado/ (guarde uma cópia: sem ela as atualizações não instalam)');
}
jar('apksigner', ['com.android.apksigner.ApkSignerTool', 'sign', '--ks', CHAVE, '--ks-type', 'PKCS12', '--ks-pass', 'file:' + SENHA,
  '--out', SAIDA, path.join(OBRA, 'alinhado.apk')]);
jar('apksigner', ['com.android.apksigner.ApkSignerTool', 'verify', SAIDA]);
fs.rmSync(SAIDA + '.idsig', { force: true });

fs.writeFileSync(VERSAO, JSON.stringify(v, null, 2) + '\n');
console.log('pronto: assets/app/na-veia.apk, versão ' + v.nome + ' (' + Math.round(fs.statSync(SAIDA).size / 1024) + ' KB)');
