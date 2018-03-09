<?php

namespace AppBundle\Controller;

use AppBundle\Entity\User;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class MainController extends Controller
{
    /**
    * @Route("/", name="welcome")
    */
    public function showAction(Request $request)
    {

      $em = $this->getDoctrine()->getManager();

      $moustiques = $em->getRepository('AppBundle:User')->findAll();

      return $this->render('default/index.html.twig', array(
          'moustiques' => $moustiques,
      ));

    }


    /**
    * @Route("/profil", name="profil")
    */
    public function profilAction(Request $request)
    {

      $em = $this->getDoctrine()->getManager();
      $moustique = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());

      $editForm = $this->createForm('AppBundle\Form\UserType',$moustique[0]);
      $editForm->handleRequest($request);

      if ($editForm->isSubmitted() && $editForm->isValid()) {
        $this->getDoctrine()->getManager()->flush();

        return $this->redirectToRoute('welcome');
      }
      return $this->render('default/profil.html.twig', array(
        'edit_form' => $editForm->createView()
      ));

    }

    /**
    * @Route("/view/{id}", name="view")
    */
    public function viewAction(Request $request)
    {
      $id = $request->get('id');
      $em = $this->getDoctrine()->getManager();
      $moustique = $em->getRepository('AppBundle:User')->findById($id);

      return $this->render('default/view.html.twig', array(
        'moustique' => $moustique[0]
      ));

    }

    /**
    * @Route("/add/{id}", name="add")
    */
    public function addAction(Request $request)
    {
      $id = $request->get('id');
      $em = $this->getDoctrine()->getManager();
      $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());
      $moustiqueCible = $em->getRepository('AppBundle:User')->findById($id);
      $moustiqueSource[0]->addMoustique($moustiqueCible[0]);
      $temp = $moustiqueSource[0]->getMoustiques();
      $em->persist($moustiqueSource[0]);
      $em->flush();
      return $this->render('default/my.html.twig',array(
        'moustiques' => $temp,
      ));

    }

    /**
    * @Route("/remove/{id}", name="remove")
    */
    public function removeAction(Request $request)
    {
      $id = $request->get('id');
      $em = $this->getDoctrine()->getManager();
      $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());
      $moustiqueCible = $em->getRepository('AppBundle:User')->findById($id);
      $moustiqueSource[0]->removeMoustique($moustiqueCible[0]);
      $temp = $moustiqueSource[0]->getMoustiques();
      $em->persist($moustiqueSource[0]);
      $em->flush();
      return $this->render('default/my.html.twig',array(
        'moustiques' => $temp,
      ));

    }

    /**
    * @Route("/mes-moustiques", name="myList")
    */
    public function listAction(Request $request)
    {
      $em = $this->getDoctrine()->getManager();
      $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());

      $temp = $moustiqueSource[0]->getMoustiques();

      return $this->render('default/my.html.twig',array(
        'moustiques' => $temp,
      ));

    }
}
