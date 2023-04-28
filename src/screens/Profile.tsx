import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from 'native-base'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import { useForm, Controller } from 'react-hook-form'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { ScreenHeader } from '@components/ScreenHeader'
import { UserPhoto } from '@components/UserPhoto'
import { Input } from '@components/Input'
import { Button } from '@components/Button'

const PHOTO_SIZE = 33

type FileSystemProps = FileSystem.FileInfo & {
  size: number
}

type FormDataProps = {
  name: string
  password_old: string
  password_new: string
  password_new_confirm: string
}

const profileSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  password_old: yup.string().required('Informe o e-mail.').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  password_new: yup.string().required('Informe a senha.').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  password_new_confirm: yup.string().required('Confirme a senha.').oneOf([yup.ref('password_new'), ''], 'A confirmação da senha não confere.')
})

export function Profile() {

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: 'Maurici Mendes Júnior'
    }
  })

  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const [userPhoto, setUserPhoto] = useState('https://github.com/mauricimendes.png')

  const toast = useToast()

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true)
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true
      })

      if (photoSelected.canceled) return

      if (!photoSelected.assets[0].uri) return

      const photoInfo: FileSystemProps = await FileSystem.getInfoAsync(photoSelected.assets[0].uri) as FileSystemProps

      if (photoInfo.size && (photoInfo.size / 1024 / 1024) > 5) {
        toast.show({
          title: 'Essa imagem é muito grande. Escolha uam de até 5MB.',
          placement: 'top',
          bgColor: 'red.500'
        })
      }

      setUserPhoto(photoSelected.assets[0].uri)

    } catch (error) {
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  function handleChangeProfile({ name, password_old, password_new, password_new_confirm }: FormDataProps) {
    console.log(name, password_old, password_new, password_new_confirm)
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title='Perfil' />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {photoIsLoading ?
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded='full'
              startColor='gray.500'
              endColor='gray.400'
            />
            :
            <UserPhoto
              source={{ uri: userPhoto }}
              alt='Foto do usuário'
              size={PHOTO_SIZE}
            />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color='green.500' fontWeight='bold' fontSize='md' mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            name='name'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg='gray.600'
                placeholder='Nome'
                value={value}
                onChangeText={onChange}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Input
            bg='gray.600'
            placeholder='E-mail'
            isDisabled={true}
          />


          <Heading color='gray.200' fontSize='md' alignSelf='flex-start' mb={2} mt={12}>
            Alterar senha
          </Heading>

          <Controller
            name='password_old'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg='gray.600'
                placeholder='Senha antiga'
                secureTextEntry
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password_old?.message}
              />
            )}
          />

          <Controller
            name='password_new'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg='gray.600'
                placeholder='Nova senha'
                secureTextEntry
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password_new?.message}
              />
            )}
          />

          <Controller
            name='password_new_confirm'
            control={control}
            render={({ field: { value, onChange } }) => (
              <Input
                bg='gray.600'
                placeholder='Confirme a nova senha'
                secureTextEntry
                value={value}
                onChangeText={onChange}
                errorMessage={errors.password_new_confirm?.message}
              />
            )}
          />


          <Button
            title='Atualizar'
            mt={4}
            onPress={handleSubmit(handleChangeProfile)}
          />
        </Center>
      </ScrollView>
    </VStack>
  )
}