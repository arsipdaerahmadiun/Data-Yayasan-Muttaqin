const fs = require('fs');

// We can just add a global CSS class 'read-only-mode' to the body or main container, and use CSS to hide pointer events or hide buttons.
// Even better, since we have `readOnly` boolean on all views, we can just conditionally render the Add buttons via React if it's easy, or just use a CSS trick to hide `.admin-only` elements.
