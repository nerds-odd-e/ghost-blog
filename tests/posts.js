import test from 'ava';
import {processHtml} from '../src/posts.js';

test('update urls for ghost - replace domain and path', t => {
  t.is(processHtml('<p><img src="https://blog.odd-e.com/yilv/a.jpg" alt="1.jpg" /></p>'),
    '<p><img src="https://localhost:8080/content/images/a.jpg" alt="1.jpg" /></p>')
})

test('update urls for ghost - replace space and other special characters with only one dash', t => {
  t.is(processHtml('<p><img src="https://blog.odd-e.com/yilv/develop%20causal%20%26%20dynamic%20thinking.jpg" alt="1.jpg" /></p>'),
    '<p><img src="https://localhost:8080/content/images/develop-causal-dynamic-thinking.jpg" alt="1.jpg" /></p>')
  t.is(processHtml('<p><img src="https://blog.odd-e.com/yilv/with%20or%20without%20shared-component%20team%20-%201.jpg" alt="1.jpg" /></p>'),
    '<p><img src="https://localhost:8080/content/images/with-or-without-shared-component-team-1.jpg" alt="1.jpg" /></p>')
})

test('update urls for ghost - remove thumb tail', t => {
  t.is(processHtml('<p><img src="https://blog.odd-e.com/yilv/assets_c/2023/10/a-thumb-450xauto-577.jpg" alt="1.jpg" /></p>'),
    '<p><img src="https://localhost:8080/content/images/a.jpg" alt="1.jpg" /></p>')
})

test('update urls for ghost - replace http with https', t => {
  t.is(processHtml('<p><img src="http://blog.odd-e.com/basvodde/learning_scaling.jpg" alt="1.jpg" /></p>'),
    '<p><img src="https://localhost:8080/content/images/learning_scaling.jpg" alt="1.jpg" /></p>')
})

test('update urls for ghost - avoid greediness', t => {
  t.is(processHtml('<a href=\"https://blog.odd-e.com/yilv/develop%20causal%20%26%20dynamic%20thinking.jpg\"><img alt=\"develop causal &amp; dynamic thinking.jpg\" src=\"https://blog.odd-e.com/yilv/assets_c/2023/10/develop%20causal%20%26%20dynamic%20thinking-thumb-450xauto-577.jpg\" width=\"450\" height=\"65\" class=\"mt-image-none\" /></a>'),
    '<a href=\"https://localhost:8080/content/images/develop-causal-dynamic-thinking.jpg\"><img alt=\"develop causal &amp; dynamic thinking.jpg\" src=\"https://localhost:8080/content/images/develop-causal-dynamic-thinking.jpg\" width=\"450\" height=\"65\" class=\"mt-image-none\" /></a>');
})