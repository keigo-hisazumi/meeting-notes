import { describe, expect, it } from 'vitest';
import { MemoryStorage } from '../test/memoryStorage';
import { LocalAuthService } from './authService';

function createService(storage = new MemoryStorage(), session = new MemoryStorage()) {
  // テストを高速にするため反復回数を減らす
  return new LocalAuthService(storage, session, 1000);
}

describe('LocalAuthService', () => {
  it('初回登録するとログイン状態になる', async () => {
    const service = createService();
    expect(service.hasAccount()).toBe(false);
    const user = await service.register('taro', 'password123');
    expect(service.hasAccount()).toBe(true);
    expect(service.currentUser()).toEqual(user);
  });

  it('短すぎるパスワードは登録できない', async () => {
    await expect(createService().register('taro', 'short')).rejects.toThrow();
  });

  it('正しいユーザー名とパスワードでのみログインできる', async () => {
    const storage = new MemoryStorage();
    const registered = await createService(storage).register('taro', 'password123');

    const service = createService(storage);
    expect(service.currentUser()).toBeNull();
    await expect(service.login('taro', 'wrong-password')).rejects.toThrow();
    await expect(service.login('jiro', 'password123')).rejects.toThrow();
    expect(await service.login('taro', 'password123')).toEqual(registered);
    expect(service.currentUser()).toEqual(registered);
  });

  it('ログアウトするとログイン状態が解除される', async () => {
    const service = createService();
    await service.register('taro', 'password123');
    await service.logout();
    expect(service.currentUser()).toBeNull();
  });

  it('アカウントは 1 つだけ登録できる', async () => {
    const service = createService();
    await service.register('taro', 'password123');
    await expect(service.register('jiro', 'password123')).rejects.toThrow();
  });
});
