import test from 'ava';
import {imagesWithoutThumb, updateFileName} from '../src/images.js';

test('update file name - remove id at the beginning', t => {
  t.is(updateFileName('700-a.jpg'), 'a.jpg')
})

test('update file name - no special characters at the beginning', t => {
  t.is(updateFileName('700-#a.jpg'), 'a.jpg')
})

test('update file name - replace space and special characters with only one dash', t => {
  t.is(updateFileName('700-a b.jpg'), 'a-b.jpg')
  t.is(updateFileName('700-a - b.jpg'), 'a-b.jpg')
  t.is(updateFileName('700-a vs. b.jpg'), 'a-vs-b.jpg')
  t.is(updateFileName('700-a - 1.3.jpg'), 'a-1.3.jpg')
})

test('filter files - images', t => {
  t.true(imagesWithoutThumb('700-a.jpg'))
  t.true(imagesWithoutThumb('700-a.png'))
  t.true(imagesWithoutThumb('700-a.jpeg'))
  t.false(imagesWithoutThumb('700-a.html'))
})

test('filter files - no thumb', t => {
  t.false(imagesWithoutThumb('700-a-thumb-450xauto-577.jpg'))
})
