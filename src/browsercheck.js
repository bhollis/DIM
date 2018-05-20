
import { matchesUA } from 'browserslist-useragent';

if (navigator.userAgent.indexOf('Vivaldi') < 0) { // Vivaldi users can just live on the edge
  var supported = matchesUA(navigator.userAgent, {
    browsers: $BROWSERS,
    ignoreMinor: true,
    _allowHigherVersions: true
  });

  if (!supported) {
    console.warn('Browser ' + browser + ' is not supported by DIM.');
    document.getElementById('browser-warning').className = '';
  }
}
